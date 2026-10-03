import graphData from '../../eilo/graph.json'
import { parseCueRequest, sanitizePlan, type CueRequest } from '../../eilo/guess-safety'
import { LIMITS } from '../../eilo/limits'
import { deadline, fail, ok, rateLimited, readJson, warmed } from '../../eilo/http'
import { stepKindFor } from '../../eilo/ladder'
import { orderLadder, warmUpstream } from '../../eilo/openrouter'
import { project } from '../../eilo/projection'
import type { CuePlan, LifeGraph, NodeId } from '../../eilo/types'

export const dynamic = 'force-dynamic'

const API = process.env.EILO_API_URL ?? 'http://localhost:3333'
const graph = graphData as unknown as LifeGraph
const projection = project(graph)
const SERVER_MS = 2500
const MODEL_MS = 4500
const MAX_UPSTREAM_CHARS = 64_000

async function fromServer(input: CueRequest, signal: AbortSignal): Promise<CuePlan | null> {
  try {
    const upstream = await fetch(`${API}/v1/cue/rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'pitch-demo',
        projection,
        activeNodes: input.activeNodes,
        hints: input.targetId ? { kind: graph.nodes[input.targetId].kind } : {},
        lastLevel: input.lastLevel
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(SERVER_MS)])
    })
    if (!upstream.ok) {
      void upstream.body?.cancel().catch(() => {})
      return null
    }
    const text = await upstream.text()
    return text.length > MAX_UPSTREAM_CHARS ? null : sanitizePlan(graph, JSON.parse(text), input.targetId)
  } catch {
    return null
  }
}

async function fromOpenRouter(targetId: NodeId, lastLevel: number | null, signal: AbortSignal): Promise<CuePlan | null> {
  const result = await orderLadder(graph, targetId, lastLevel, AbortSignal.any([signal, AbortSignal.timeout(MODEL_MS)]))
  if (!result) return null
  const connected = new Set(graph.edges.filter(edge => edge.from === targetId || edge.to === targetId).map(edge => edge.id))
  const planned = new Map((graph.ladderPlans[targetId] ?? []).map(plan => [plan.attr, plan.edge]))
  return sanitizePlan(
    graph,
    {
      targetId,
      confidence: result.value.confidence,
      alternatives: [],
      origin: 'openrouter',
      steps: result.value.steps.map(step => ({
        attr: step.attr,
        kind: stepKindFor(step.attr),
        edge: step.edge && connected.has(step.edge) ? step.edge : (planned.get(step.attr) ?? null)
      }))
    },
    targetId
  )
}

export async function GET(request: Request) {
  return warmed(request, warmUpstream)
}

export async function POST(request: Request) {
  const limited = rateLimited(request, 'cue', { limit: 40, windowMs: 60_000 })
  if (limited) return limited
  const body = await readJson(request, LIMITS.cueBodyBytes)
  if (body instanceof Response) return body
  const input = parseCueRequest(graph, body.value)
  const signal = deadline(request, SERVER_MS + MODEL_MS + 500)

  const server = await fromServer(input, signal)
  if (server && server.origin !== 'deterministic') return ok(server)

  const direct = input.targetId ? await fromOpenRouter(input.targetId, input.lastLevel, signal) : null
  if (direct) return ok(direct)
  if (server) return ok(server)
  return fail(502, 'cue unavailable')
}
