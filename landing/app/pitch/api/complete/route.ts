import graphData from '../../eilo/graph.json'
import { plausibleWord } from '../../eilo/guess-safety'
import { LIMITS } from '../../eilo/limits'
import { screenTranscript } from '../../eilo/text-safety'
import { deadline, fail, ok, rateLimited, readJson, warmed } from '../../eilo/http'
import { guessWord, openRouterReady, warmUpstream } from '../../eilo/openrouter'
import type { LifeGraph } from '../../eilo/types'

export const dynamic = 'force-dynamic'

const graph = graphData as unknown as LifeGraph
const BUDGET_MS = 6000

export async function GET(request: Request) {
  return warmed(request, warmUpstream)
}

export async function POST(request: Request) {
  const limited = rateLimited(request, 'complete', { limit: 90, windowMs: 60_000 })
  if (limited) return limited
  if (!openRouterReady()) return fail(503, 'completion unavailable')
  const body = await readJson(request, LIMITS.jsonBodyBytes)
  if (body instanceof Response) return body
  const payload = body.value as { transcript?: unknown; judge?: unknown; hint?: unknown; after?: unknown; target?: unknown } | null
  const raw = payload?.transcript
  if (typeof raw !== 'string' || raw.length > LIMITS.transcriptChars * 4) return fail(400, 'invalid transcript')
  const screened = screenTranscript(raw)
  if (!screened.text) return fail(422, screened.discarded ?? 'empty transcript')
  const hint = typeof payload?.hint === 'string' && payload.hint.length <= LIMITS.cueChars * 2 ? payload.hint : null
  const after = hint && typeof payload?.after === 'string' ? screenTranscript(payload.after).text : null
  const target = hint ? plausibleWord(payload?.target) : null
  const result = await guessWord(graph, screened.text, deadline(request, BUDGET_MS), payload?.judge === true, hint, after, target)
  if (!result) return fail(502, 'completion failed')
  if (!result.value) return fail(422, 'no safe guess')
  return ok({ guess: result.value, model: result.model, ms: result.ms })
}
