import graph from '../src/data/graph.json'
import cache from '../src/data/ladders.cache.json'
import { deterministicPlan, validatePlan } from '../src/domain/ladder'
import type { CuePlan, LifeGraph, NodeId } from '../src/domain/types'

const MODEL_TIMEOUT_MS = 2500
const MODEL = process.env.CUE_MODEL ?? 'claude-sonnet-5'
const lifeGraph = graph as unknown as LifeGraph

interface CueRequest {
  utterance: string
  context: string[]
  activeNodes: NodeId[]
}

interface ScoredCandidate {
  id: NodeId
  score: number
}

function candidates(req: CueRequest): ScoredCandidate[] {
  const text = `${req.context.join(' ')} ${req.utterance}`.toLowerCase()

  const activation = new Map<NodeId, number>()
  for (const id of req.activeNodes) activation.set(id, 1)
  for (const edge of lifeGraph.edges) {
    const from = activation.get(edge.from) ?? 0
    const to = activation.get(edge.to) ?? 0
    if (from > 0) activation.set(edge.to, Math.max(to, from * edge.weight * 0.6))
    if (to > 0) activation.set(edge.from, Math.max(from, to * edge.weight * 0.6))
  }

  return Object.values(lifeGraph.nodes)
    .filter(node => node.id !== lifeGraph.owner)
    .map(node => {
      const spread = activation.get(node.id) ?? 0
      const lexical = node.aliases?.some(a => text.includes(a.toLowerCase())) ? 0.4 : 0
      const kindHint = /minha|meu/.test(text) && node.kind === 'person' ? 0.25 : 0
      return { id: node.id, score: spread + lexical + kindHint }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
}

function systemPrompt(pool: ScoredCandidate[]): string {
  const described = pool.map(c => {
    const node = lifeGraph.nodes[c.id]!
    const edges = lifeGraph.edges
      .filter(e => e.from === c.id || e.to === c.id)
      .map(e => `${e.id}:${e.rel}`)
      .join(', ')
    return `${c.id} | ${node.kind} | ${JSON.stringify(node.attrs)} | edges: ${edges}`
  })

  return [
    'Voce ranqueia candidatos de um grafo pessoal para ajudar alguem com anomia a alcancar uma palavra.',
    'Regras: escada crescente do geral ao especifico; nunca entregue a palavra; cada degrau cita uma aresta existente.',
    'Responda apenas com identificadores, em JSON, sem texto livre.',
    'Candidatos:',
    ...described
  ].join('\n')
}

async function rerank(req: CueRequest, pool: ScoredCandidate[]): Promise<CuePlan | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: systemPrompt(pool),
        messages: [
          {
            role: 'user',
            content: `Contexto: ${req.context.join(' | ')}\nTentativa: "${req.utterance}"`
          }
        ]
      })
    })

    if (!res.ok) return null
    const body = await res.json()
    const raw = body?.content?.[0]?.text
    if (typeof raw !== 'string') return null

    const parsed = JSON.parse(raw) as CuePlan
    return { ...parsed, origin: 'model' }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function cached(targetId: NodeId): CuePlan | null {
  const entry = (cache as Record<string, CuePlan>)[targetId]
  return entry ? { ...entry, origin: 'cache' } : null
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const req = (await request.json()) as CueRequest
  const pool = candidates(req)
  const fallbackId = pool[0]?.id

  if (!fallbackId) {
    return new Response(JSON.stringify({ error: 'no candidates' }), { status: 422 })
  }

  const fromModel = await rerank(req, pool)
  if (fromModel && validatePlan(lifeGraph, fromModel)) {
    return Response.json(fromModel)
  }

  const fromCache = cached(fallbackId)
  if (fromCache && validatePlan(lifeGraph, fromCache)) {
    return Response.json(fromCache)
  }

  return Response.json(deterministicPlan(lifeGraph, fallbackId))
}
