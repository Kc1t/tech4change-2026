import { PHONOLOGICAL_CONFIDENCE_GATE, stepKindFor, validatePlan } from './ladder'
import { LIMITS } from './limits'
import { clampConfidence, cleanTranscript, fold, hallucinationReason, isOffensive, tokensOf } from './text-safety'
import type { CuePlan, Guess, HelpCall, LifeGraph, NodeId, StepKind } from './types'

const FUNCTION_WORDS = new Set([
  'a', 'o', 'as', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos', 'em', 'um', 'uma', 'que', 'com', 'pra',
  'para', 'por', 'meu', 'minha', 'seu', 'sua', 'ela', 'ele', 'eu', 'isso', 'esse', 'essa', 'sim', 'nao', 'mas', 'se', 'ja'
])

export function plausibleWord(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const word = raw
    .normalize('NFC')
    .replace(/^[\s"'“”‘’.,;:!?…()[\]{}<>*_`-]+|[\s"'“”‘’.,;:!?…()[\]{}<>*_`-]+$/gu, '')
    .replace(/\s+/g, ' ')
  if (word.length < 2 || word.length > LIMITS.wordChars) return null
  if (!/^\p{L}[\p{L}\p{M}'’-]*( \p{L}[\p{L}\p{M}'’-]*)?$/u.test(word)) return null
  if (word.split(' ').length > LIMITS.wordTokens) return null
  const folded = fold(word)
  if (!/[aeiouy]/.test(folded) || FUNCTION_WORDS.has(folded) || isOffensive(word)) return null
  return word
}

function stemLength(name: string): number {
  return Math.max(4, Math.ceil(name.length * 0.6))
}

function tokenLeaks(token: string, nameTokens: string[]): boolean {
  if (!token) return false
  return nameTokens.some(name => {
    if (token === name) return true
    if (name.length < 4 || token.length < 4) return false
    const size = stemLength(name)
    return token.length >= size && token.slice(0, size) === name.slice(0, size)
  })
}

function nameTokensOf(names: string[]): string[] {
  return [...new Set(names.flatMap(tokensOf).filter(token => token.length >= 2 && !FUNCTION_WORDS.has(token)))]
}

export function leaksTarget(text: string, names: string[]): boolean {
  const nameTokens = nameTokensOf(names)
  if (tokensOf(text).some(token => tokenLeaks(token, nameTokens))) return true
  const compact = fold(text).replace(/ /g, '')
  return names.map(name => fold(name).replace(/ /g, '')).some(name => name.length >= 4 && compact.includes(name))
}

export function repairCue(raw: unknown, names: string[]): string | null {
  const text = cleanTranscript(raw, LIMITS.cueChars * 2, LIMITS.cueWords)
  if (!text || isOffensive(text) || hallucinationReason(text)) return null
  if (!leaksTarget(text, names)) return text.length <= LIMITS.cueChars ? text : null
  const nameTokens = nameTokensOf(names)
  const masked = text
    .split(' ')
    .map(part => (tokensOf(part).some(token => tokenLeaks(token, nameTokens)) ? '…' : part))
    .join(' ')
  if (leaksTarget(masked, names)) return null
  const kept = masked.split(' ').filter(part => tokensOf(part).some(token => token.length >= 2))
  return kept.length >= 3 && masked.length <= LIMITS.cueChars ? masked : null
}

export function firstSoundFor(word: string, proposed: unknown): string | null {
  const target = fold(word).replace(/ /g, '')
  if (target.length < 2) return null
  const wanted = typeof proposed === 'string' ? fold(proposed).replace(/ /g, '') : ''
  let size = wanted.length >= 1 && wanted.length <= LIMITS.firstSoundChars && target.startsWith(wanted) ? wanted.length : 0
  if (size === 0 || size >= target.length) {
    const syllable = /^[^aeiouy]*[aeiouy]+/.exec(target)?.[0] ?? target.slice(0, 1)
    size = Math.min(syllable.length, LIMITS.firstSoundChars, target.length - 1)
  }
  if (size >= target.length || size < 1) return null
  let taken = ''
  let foldedSoFar = ''
  for (const ch of word.normalize('NFC')) {
    if (foldedSoFar.length >= size) break
    const piece = fold(ch)
    if (piece) foldedSoFar += piece
    if (/\p{L}/u.test(ch)) taken += ch
  }
  return taken || null
}

export function namesOfNode(graph: LifeGraph, nodeId: NodeId): string[] {
  const node = graph.nodes[nodeId]
  return node ? [node.label, ...(node.aliases ?? [])] : []
}

export function nodeFor(graph: LifeGraph, nodeId: unknown, word: unknown): NodeId | null {
  if (typeof nodeId === 'string' && nodeId !== graph.owner && Object.hasOwn(graph.nodes, nodeId)) return nodeId
  if (typeof word !== 'string') return null
  const wanted = fold(word)
  if (!wanted) return null
  const hit = Object.values(graph.nodes).find(node => node.id !== graph.owner && [node.label, ...(node.aliases ?? [])].some(name => fold(name) === wanted))
  return hit?.id ?? null
}

const HELP_CALLS = new Set<HelpCall>(['wait', 'next', 'strong', 'word'])

export function sanitizeGuess(graph: LifeGraph, value: unknown): Guess | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const json = value as Record<string, unknown>
  const proposed = plausibleWord(json.word)
  const nodeId = nodeFor(graph, json.nodeId, proposed)
  const word = nodeId ? graph.nodes[nodeId].label : proposed
  const ownerNames = namesOfNode(graph, graph.owner).map(fold)
  if (!word || ownerNames.includes(fold(word))) return null
  const names = nodeId ? namesOfNode(graph, nodeId) : [word]
  const seen = new Set([...names, ...namesOfNode(graph, graph.owner)].map(fold))
  const alternatives: Guess['alternatives'] = []
  for (const item of Array.isArray(json.alternatives) ? json.alternatives.slice(0, 8) : []) {
    if (!item || typeof item !== 'object') continue
    const alt = item as { nodeId?: unknown; word?: unknown }
    const altWord = plausibleWord(alt.word)
    const id = nodeFor(graph, alt.nodeId, altWord)
    const label = id ? graph.nodes[id].label : altWord
    if (!label || seen.has(fold(label))) continue
    seen.add(fold(label))
    alternatives.push({ word: label, nodeId: id })
    if (alternatives.length >= LIMITS.alternatives) break
  }
  const cues = (Array.isArray(json.cues) ? json.cues.slice(0, 6) : [])
    .map(cue => repairCue(cue, names))
    .filter((cue): cue is string => cue !== null && !cue.includes('…'))
    .slice(0, LIMITS.cues)
  return {
    word,
    nodeId,
    confidence: clampConfidence(json.confidence),
    stalled: json.stalled === true || json.stalled === 'true',
    stallConfidence: clampConfidence(json.stallConfidence),
    frustration: clampConfidence(json.frustration),
    help: HELP_CALLS.has(json.help as HelpCall) ? (json.help as HelpCall) : null,
    alternatives,
    cues,
    firstSound: firstSoundFor(word, json.firstSound)
  }
}

const STEP_KINDS = new Set<StepKind>(['category', 'relation', 'place', 'use', 'shape', 'phonological'])
const ORIGINS = new Set<CuePlan['origin']>(['model', 'cache', 'deterministic', 'openrouter'])

export function sanitizePlan(graph: LifeGraph, value: unknown, wanted: NodeId | null = null): CuePlan | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const targetId = typeof raw.targetId === 'string' ? raw.targetId : null
  if (!targetId || targetId === graph.owner || !Object.hasOwn(graph.nodes, targetId)) return null
  if (wanted !== null && targetId !== wanted) return null
  const target = graph.nodes[targetId]
  if (!Array.isArray(raw.steps)) return null
  const used = new Set<string>()
  const steps: CuePlan['steps'] = []
  for (const item of raw.steps.slice(0, LIMITS.ladderSteps * 2)) {
    if (!item || typeof item !== 'object') continue
    const step = item as { attr?: unknown; kind?: unknown; edge?: unknown }
    if (typeof step.attr !== 'string' || !Object.hasOwn(target.attrs, step.attr) || used.has(step.attr)) continue
    used.add(step.attr)
    const kind = typeof step.kind === 'string' && STEP_KINDS.has(step.kind as StepKind) && step.kind !== 'phonological' ? (step.kind as StepKind) : stepKindFor(step.attr)
    steps.push({ level: steps.length + 1, kind, attr: step.attr, edge: typeof step.edge === 'string' ? step.edge : null })
    if (steps.length >= LIMITS.ladderSteps) break
  }
  if (steps.length === 0) return null
  const plan: CuePlan = {
    targetId,
    confidence: clampConfidence(raw.confidence),
    alternatives: (Array.isArray(raw.alternatives) ? raw.alternatives : [])
      .filter((id): id is string => typeof id === 'string' && id !== targetId && id !== graph.owner && Object.hasOwn(graph.nodes, id))
      .slice(0, LIMITS.alternatives),
    steps,
    origin: typeof raw.origin === 'string' && ORIGINS.has(raw.origin as CuePlan['origin']) ? (raw.origin as CuePlan['origin']) : 'model'
  }
  return validatePlan(graph, plan) ? plan : null
}

export type CueRequest = { targetId: NodeId | null; lastLevel: number | null; activeNodes: NodeId[] }

export function parseLevel(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= LIMITS.maxLevel ? value : null
}

export function parseCueRequest(graph: LifeGraph, value: unknown): CueRequest {
  const body = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const known = (id: unknown): id is NodeId => typeof id === 'string' && id.length <= 64 && Object.hasOwn(graph.nodes, id)
  const targetId = known(body.targetId) && body.targetId !== graph.owner ? body.targetId : null
  const active = Array.isArray(body.activeNodes) ? body.activeNodes.slice(0, LIMITS.activeNodes * 4).filter(known) : []
  const activeNodes = [...new Set([graph.owner, ...(targetId ? [targetId] : []), ...active])].slice(0, LIMITS.activeNodes)
  return { targetId, lastLevel: parseLevel(body.lastLevel), activeNodes }
}

export type Rung = { text: string; kind: string }
export type LadderLike = Array<{ text: string; kind: string }>

export function safeRungs(names: string[], word: string, ladder: LadderLike, confidence: number): Rung[] {
  const rungs = ladder
    .filter(step => step.kind !== 'phonological' || confidence >= PHONOLOGICAL_CONFIDENCE_GATE)
    .filter(step => step.text.trim() !== '' && !isOffensive(step.text))
    .filter(step => step.kind === 'phonological' || !leaksTarget(step.text, names))
    .filter(step => step.kind !== 'phonological' || fold(step.text).replace(/ /g, '').length < fold(word).replace(/ /g, '').length)
    .map(step => ({ text: step.text, kind: step.kind }))
  const hints = rungs.filter(rung => rung.kind !== 'phonological')
  const sound = rungs.find(rung => rung.kind === 'phonological') ?? hints[1]
  return [hints[0], sound, { text: word, kind: 'word' }].filter((rung): rung is Rung => rung !== undefined)
}

export function freeWordRungs(guess: Guess): Rung[] {
  const names = [guess.word]
  const cueKinds = ['category', 'relation']
  const ladder: LadderLike = guess.cues.filter(text => !text.includes('…')).map((text, index) => ({ text, kind: cueKinds[index] ?? 'relation' }))
  if (guess.firstSound) ladder.push({ text: `${guess.firstSound.charAt(0).toUpperCase()}${guess.firstSound.slice(1)}…`, kind: 'phonological' })
  return safeRungs(names, guess.word, ladder, guess.confidence)
}
