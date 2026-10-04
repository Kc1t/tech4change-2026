import graphData from '../../eilo/graph.json'
import { checkAudio } from '../../eilo/audio-check'
import { LIMITS } from '../../eilo/limits'
import { screenTranscript } from '../../eilo/text-safety'
import { deadline, fail, ok, rateLimited, readCapped, warmed } from '../../eilo/http'
import { openRouterReady, transcribe, warmUpstream } from '../../eilo/openrouter'
import type { LifeGraph } from '../../eilo/types'

export const dynamic = 'force-dynamic'

const BUDGET_MS = 7000
const VOCABULARY = ['Eilo', ...Object.values((graphData as unknown as LifeGraph).nodes).flatMap(node => [node.label, ...(node.aliases ?? [])])]

export async function GET(request: Request) {
  return warmed(request, warmUpstream)
}

export async function POST(request: Request) {
  const limited = rateLimited(request, 'transcribe', { limit: 240, windowMs: 60_000 })
  if (limited) return limited
  if (!openRouterReady()) return fail(503, 'transcription unavailable')
  const audio = await readCapped(request, LIMITS.audioMaxBytes)
  if (audio === 'too-large') return fail(413, 'audio too large')
  if (!audio) return fail(400, 'unreadable body')
  const check = checkAudio(audio, request.headers.get('content-type') ?? '', request.headers.get('x-audio-ms'))
  if (!check.ok) return fail(check.status, check.error)
  const result = await transcribe(Buffer.from(audio).toString('base64'), check.format, deadline(request, BUDGET_MS), VOCABULARY)
  if (!result) return fail(502, 'transcription failed')
  const screened = screenTranscript(result.value)
  return ok({ text: screened.text, discarded: screened.discarded, model: result.model, ms: result.ms })
}
