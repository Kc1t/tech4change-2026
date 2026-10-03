import { sanitizeGuess, sanitizePlan } from '../eilo/guess-safety'
import { screenTranscript } from '../eilo/text-safety'
import type { CuePlan, Guess, LifeGraph, NodeId } from '../eilo/types'
import { ROUTES, TIMING } from './config'
import type { Network } from './types'

export type Timed<T> = { value: T; ms: number }

export type Reply = { status: number; body: unknown; ms: number } | null

export type GuessRequest = { judge?: boolean; hint?: string | null; after?: string; current?: string | null }

const WARM_TIMEOUT_MS = 8000
const MAX_ACTIVE_NODES = 32

export function warmRoutes() {
  for (const route of Object.values(ROUTES)) fetch(`${route}?warm=1`, { signal: AbortSignal.timeout(WARM_TIMEOUT_MS) }).catch(() => {})
}

export function networkOf(reply: Reply): Network | null {
  if (!reply || reply.status >= 500 || reply.status === 429) return 'offline'
  return reply.status < 300 ? 'online' : null
}

async function postJson(url: string, payload: unknown, timeoutMs: number, cancel: AbortSignal): Promise<Reply> {
  if (navigator.onLine === false || cancel.aborted) return null
  const started = performance.now()
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.any([cancel, AbortSignal.timeout(timeoutMs)])
    })
    const body = response.ok ? ((await response.json()) as unknown) : null
    return { status: response.status, body, ms: Math.round(performance.now() - started) }
  } catch {
    return null
  }
}

export class ModelClient {
  private controller = new AbortController()

  constructor(
    private readonly graph: LifeGraph,
    private readonly onReply: (reply: Reply) => void
  ) {}

  cancelAll() {
    this.controller.abort()
    this.controller = new AbortController()
  }

  async guess(transcript: string, request: GuessRequest = {}): Promise<Timed<Guess> | null> {
    const screened = screenTranscript(transcript)
    if (!screened.text) return null
    const cancel = this.controller.signal
    const payload = request.hint
      ? { transcript: screened.text, judge: request.judge ?? false, hint: request.hint, after: screenTranscript(request.after ?? '').text, target: request.current ?? null }
      : { transcript: screened.text, judge: request.judge ?? false }
    const reply = await postJson(ROUTES.complete, payload, TIMING.completeTimeoutMs, cancel)
    if (cancel.aborted) return null
    this.onReply(reply)
    const guess = reply ? sanitizeGuess(this.graph, (reply.body as { guess?: unknown } | null)?.guess) : null
    return reply && guess ? { value: guess, ms: reply.ms } : null
  }

  async plan(targetId: NodeId, mentioned: NodeId[], lastLevel: number | null): Promise<Timed<CuePlan> | null> {
    const cancel = this.controller.signal
    const activeNodes = [...new Set([this.graph.owner, targetId, ...mentioned])].slice(0, MAX_ACTIVE_NODES)
    const reply = await postJson(ROUTES.cue, { targetId, activeNodes, lastLevel }, TIMING.cueTimeoutMs, cancel)
    if (cancel.aborted) return null
    this.onReply(reply)
    const plan = reply ? sanitizePlan(this.graph, reply.body, targetId) : null
    return reply && plan ? { value: plan, ms: reply.ms } : null
  }
}
