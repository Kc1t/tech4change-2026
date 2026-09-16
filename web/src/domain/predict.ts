import type { LifeGraph, NodeId } from './types'

const SPREAD_DECAY = 0.75
const HOPS = 2
const MIN_TOKEN = 3
const STOP = new Set([
  'que',
  'quem',
  'onde',
  'como',
  'uma',
  'meu',
  'minha',
  'aquela',
  'aquele',
  'coisa',
  'para',
  'pra',
  'com',
  'dos',
  'das',
  'nos',
  'nas',
  'ele',
  'ela',
  'eles',
  'elas',
  'esta',
  'este',
  'isso',
  'mais',
  'muito',
  'tava',
  'esta',
  'the'
])

export interface Prediction {
  targetId: NodeId | null
  confidence: number
  mentioned: NodeId[]
  named: NodeId[]
  alternatives: NodeId[]
}

export const EMPTY_PREDICTION: Prediction = {
  targetId: null,
  confidence: 0,
  mentioned: [],
  named: [],
  alternatives: []
}

export const CONFIDENCE_FLOOR = 0.35

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function tokens(text: string): string[] {
  return normalise(text)
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= MIN_TOKEN && !STOP.has(token))
}

interface Hit {
  id: NodeId
  score: number
  byName: boolean
}

function hitsFor(graph: LifeGraph, transcript: string): Hit[] {
  const said = tokens(transcript)
  if (said.length === 0) return []

  const hits: Hit[] = []

  for (const node of Object.values(graph.nodes)) {
    const names = [node.label, ...(node.aliases ?? [])].flatMap(tokens)
    const byName = names.some(name => said.includes(name))

    let score = byName ? 1 : 0
    for (const attr of Object.values(node.attrs)) {
      for (const word of tokens(attr)) {
        if (said.includes(word)) score += 0.3
      }
    }

    if (score > 0) hits.push({ id: node.id, score, byName })
  }

  return hits.sort((a, b) => b.score - a.score)
}

export function mentioned(graph: LifeGraph, transcript: string): NodeId[] {
  return hitsFor(graph, transcript).map(hit => hit.id)
}

function spread(graph: LifeGraph, seeds: NodeId[]): Map<NodeId, number> {
  const activation = new Map<NodeId, number>()
  for (const id of seeds) activation.set(id, 1)

  for (let hop = 0; hop < HOPS; hop++) {
    for (const edge of graph.edges) {
      const from = activation.get(edge.from) ?? 0
      const to = activation.get(edge.to) ?? 0
      if (from > 0) activation.set(edge.to, Math.max(to, from * edge.weight * SPREAD_DECAY))
      if (to > 0) activation.set(edge.from, Math.max(from, to * edge.weight * SPREAD_DECAY))
    }
  }

  return activation
}

export function predict(graph: LifeGraph, transcript: string): Prediction {
  const hits = hitsFor(graph, transcript)
  if (hits.length === 0) return EMPTY_PREDICTION

  const heard = hits.map(hit => hit.id)
  const named = hits.filter(hit => hit.byName).map(hit => hit.id)
  const activation = spread(graph, [...new Set([...heard, graph.owner])])

  const hinted = new Map<NodeId, number>()
  for (const hit of hits) if (!hit.byName) hinted.set(hit.id, hit.score)

  const ranked = [...activation.entries()]
    .filter(([id]) => id !== graph.owner && !named.includes(id))
    .map(([id, value]) => [id, value + (hinted.get(id) ?? 0)] as const)
    .sort((a, b) => b[1] - a[1])

  const best = ranked[0]
  if (!best) return { ...EMPTY_PREDICTION, mentioned: heard, named }

  const runnerUp = ranked[1]?.[1] ?? 0

  return {
    targetId: best[0],
    confidence: Math.min(1, best[1] * 0.55 + (best[1] - runnerUp)),
    mentioned: heard,
    named,
    alternatives: ranked.slice(1, 4).map(entry => entry[0])
  }
}
