import { fold, screenTranscript, tokensOf } from './text-safety'
import type { Guess } from './types'

const OPEN_ENDINGS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos', 'em', 'e', 'que', 'com', 'pra',
  'para', 'pro', 'meu', 'minha', 'meus', 'minhas', 'seu', 'sua', 'nossa', 'nosso', 'aquela', 'aquele', 'aquilo', 'esse', 'essa',
  'este', 'esta', 'tipo', 'chama', 'chamava', 'ne', 'hum', 'humm', 'hmm', 'hm', 'ahn', 'an', 'ah', 'eh', 'uh', 'uhm', 'ha'
])

export const BLOCK_TIMING = {
  frustratedSilenceMs: 700,
  frustrationToOpen: 0.7,
  givingUpToOpen: 0.8,
  minSpeechMs: 700,
  openSilenceMs: 1100,
  judgeSilenceMs: 1100,
  settleWaitMs: 3000,
  minWords: 2,
  cooldownMs: 2500,
  stallConfidence: 0.6
} as const

export type BlockGate = {
  phase: 'idle' | 'cue' | 'success' | 'given'
  blockActive: boolean
  speechMs: number
  silenceMs: number
  sinceBlockEndMs: number
  settled: boolean
  newText: string
  recentText: string
  browserTail?: string
}

export type StallCall = 'wait' | 'start' | 'judge'

export function endsOpen(text: string): boolean {
  const trimmed = text.trim()
  if (/(…|\.\.\.|-|,)$/.test(trimmed)) return true
  const tokens = tokensOf(trimmed)
  const last = tokens[tokens.length - 1]
  if (!last) return false
  return OPEN_ENDINGS.has(last) || (tokens.length >= 2 && tokens[tokens.length - 2] === last)
}

const NAME = '( (o|do|a|da) nome| a palavra)?( (dela|dele|disso|daquilo))?'

const ASK_WORD = new RegExp(`\\b(me ajud[ae]|socorro|desisto|esquece( isso)?|deixa (pra la|quieto)|me (fala|diz)${NAME}|fala (pra|para) mim|fala (voce|vc)|diz (pra|para) mim|me (da|de) a palavra|qual (e|era) a palavra)$`)
const GIVE_UP = new RegExp(`\\b(nao (me )?(lembro|recordo)( mais| de nada| nada)?|nao (to|tou|estou) (me )?(lembrando|conseguindo)( lembrar| falar)?|nao consigo( (me )?(lembrar|falar|dizer|achar|pensar))?|esqueci( tudo)?|deu (um )?(branco|apagao)|travei|nao me (vem|sai)|me (fugiu|sumiu)|(nao (vem|sai|sei|acho|encontro)|sumiu|fugiu) ((o|do|a|da) nome|a palavra)|(sumiu|fugiu|apagou)( tudo)? (da|na) (minha )?(cabeca|memoria)|(ta|esta|fica) na ponta da lingua)${NAME}$`)
const ASK_NAME = new RegExp(`\\b(como (e )?(que )?(e|era|chama|chamava|se chama|se chamava|fala|se fala|diz|se diz)( mesmo)?${NAME}( mesmo)?( (isso|aquilo|ela|ele))?|qual (e |era )?(mesmo )?(o nome|mesmo)${NAME}|(me )?(da|de) uma (dica|ajuda|ajudinha)|(comeca|comecava) com (que|qual)( letra)?)$`)
const EXCLAIM = /\b(meu deus|nossa senhora|que raiva|droga|poxa vida|ai ai|ai meu deus|caramba|putz|que coisa|que dificil|ta dificil|nao acredito|nao (vem|sai))$/
const UNSURE = /\bnao sei$/

const GIVING_UP: Array<[RegExp, number]> = [[ASK_WORD, 0.9], [GIVE_UP, 0.85], [ASK_NAME, 0.8], [EXCLAIM, 0.7], [UNSURE, 0.5]]

const TAIL_PHRASES = [['por', 'nada'], ['de', 'jeito', 'nenhum'], ['de', 'jeito', 'algum'], ['nem', 'a', 'pau'], ['meu', 'deus'], ['nossa', 'senhora'], ['pelo', 'amor', 'de', 'deus'], ['por', 'favor']]
const TAIL_WORDS = new Set(['ai', 'aii', 'ah', 'ahn', 'an', 'hum', 'humm', 'hmm', 'hm', 'eh', 'ne', 'uh', 'uhm', 'aff', 'ui', 'mesmo', 'agora', 'nao', 'gente', 'viu', 'hein', 'cara', 'nossa', 'poxa', 'credo', 'sabe', 'total', 'geral', 'completo'])
const MAX_TAIL_CUTS = 4
const SIGHS = new Set(['ai', 'aff', 'ui', 'ah', 'aah', 'ahh', 'aii', 'puxa'])

const ASKS_FOR_WORD = /\b(nao (me )?lembro|nao (to|tou|estou) (me )?(lembrando|conseguindo)|nao consigo|esqueci|me ajud[ae]|socorro|fala (pra|para) mim|fala (voce|vc)|me (fala|diz) (o nome|a palavra|qual e)|diz (pra|para) mim|me (da|de) a palavra|qual (e|era) a palavra|desisto|esquece|deixa (pra la|quieto)|deu (um )?(branco|apagao)|me (fugiu|sumiu)|nao me (vem|sai)|nao (vem|sai) (o nome|a palavra)|(sumiu|fugiu)( tudo)? (a palavra|o nome|da cabeca|da memoria|da minha cabeca|da minha memoria))\b/

function tailCuts(tokens: string[]): string[] {
  const cuts: string[] = []
  let end = tokens.length
  for (let cut = 0; cut <= MAX_TAIL_CUTS && end > 0; cut += 1) {
    cuts.push(tokens.slice(0, end).join(' '))
    const phrase = TAIL_PHRASES.find(words => words.length <= end && words.every((word, i) => tokens[end - words.length + i] === word))
    if (phrase) end -= phrase.length
    else if (TAIL_WORDS.has(tokens[end - 1])) end -= 1
    else break
  }
  return cuts
}

export function asksForWord(text: string): boolean {
  return ASKS_FOR_WORD.test(fold(text)) || tailCuts(tokensOf(text)).some(core => ASK_WORD.test(core))
}

export type Struggle = { frustration: number; hesitant: boolean; givingUp: boolean }

export function struggleOf(text: string): Struggle {
  const tokens = tokensOf(text)
  if (tokens.length === 0) return { frustration: 0, hesitant: false, givingUp: false }
  let frustration = 0
  for (const core of tailCuts(tokens)) for (const [pattern, weight] of GIVING_UP) if (pattern.test(core)) frustration = Math.max(frustration, weight)
  const givingUp = frustration >= 0.7
  const tail = tokens.slice(-6)
  const sighs = tail.filter(token => SIGHS.has(token)).length
  if (sighs > 0) frustration = Math.max(frustration, Math.min(0.3 + 0.15 * sighs, 0.6))
  let repeats = 0
  for (let i = 1; i < tail.length; i += 1) if (tail[i] === tail[i - 1]) repeats += 1
  if (repeats > 0) frustration = Math.max(frustration, Math.min(0.35 + 0.15 * repeats, 0.65))
  if (givingUp && (sighs > 0 || repeats > 0)) frustration = Math.min(1, frustration + 0.1)
  return { frustration, hesitant: repeats > 0 || endsOpen(text), givingUp }
}

export function splitTurns(text: string): { question: string | null; answer: string } {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map(sentence => sentence.trim()).filter(Boolean) ?? []
  let cut = -1
  sentences.forEach((sentence, k) => {
    if (sentence.endsWith('?') && !struggleOf(sentence).givingUp) cut = k
  })
  if (cut < 0) return { question: null, answer: text.trim() }
  return { question: sentences[cut], answer: sentences.slice(cut + 1).join(' ') }
}

export function closesThought(text: string, minWords: number): boolean {
  const content = tokensOf(text).filter(token => !OPEN_ENDINGS.has(token))
  return content.length >= minWords && !endsOpen(text)
}

export function stallDecision(gate: BlockGate): StallCall {
  if (gate.phase !== 'idle' || gate.blockActive) return 'wait'
  if (gate.sinceBlockEndMs < BLOCK_TIMING.cooldownMs) return 'wait'
  if (gate.silenceMs < BLOCK_TIMING.frustratedSilenceMs) return 'wait'
  if (!gate.settled && gate.silenceMs < BLOCK_TIMING.settleWaitMs) return 'wait'
  if (tokensOf(gate.newText).length === 0) return 'wait'
  if (struggleOf(gate.newText).frustration >= BLOCK_TIMING.givingUpToOpen) return 'start'
  if (gate.silenceMs < Math.min(BLOCK_TIMING.openSilenceMs, BLOCK_TIMING.judgeSilenceMs)) return 'wait'
  const recent = screenTranscript(gate.recentText)
  if (recent.discarded || tokensOf(recent.text).length < BLOCK_TIMING.minWords) return 'wait'
  const tail = gate.browserTail ? screenTranscript(gate.browserTail).text : ''
  if (gate.silenceMs >= BLOCK_TIMING.openSilenceMs && (endsOpen(recent.text) || (tail !== '' && endsOpen(tail)))) return 'start'
  if (gate.speechMs < BLOCK_TIMING.minSpeechMs || gate.silenceMs < BLOCK_TIMING.judgeSilenceMs) return 'wait'
  const fresh = screenTranscript(gate.newText)
  if (fresh.discarded || tokensOf(fresh.text).length < BLOCK_TIMING.minWords) return 'wait'
  if (/\?\s*$/.test(fresh.text)) return 'wait'
  return 'judge'
}

export function judgedStall(guess: Guess | null): boolean {
  if (!guess) return false
  if (guess.stalled && guess.stallConfidence >= BLOCK_TIMING.stallConfidence) return true
  return (guess.frustration ?? 0) >= BLOCK_TIMING.frustrationToOpen && guess.help !== 'wait' && guess.help != null
}
