import { takeToken, type RateBucket, type RateRule } from './rate-limit'

const globalRate = globalThis as unknown as { pitchRate?: Map<string, RateBucket> }
const rateStore = (globalRate.pitchRate ??= new Map())

const NO_STORE = { 'Cache-Control': 'no-store' }

export function fail(status: number, error: string, headers: Record<string, string> = {}): Response {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } })
}

export function ok(body: unknown): Response {
  return Response.json(body, { headers: NO_STORE })
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')?.trim()
  return (forwarded || real || 'local').slice(0, 64)
}

export function rateLimited(request: Request, route: string, rule: RateRule): Response | null {
  const verdict = takeToken(rateStore, `${route}:${clientKey(request)}`, Date.now(), rule)
  if (verdict.ok) return null
  return fail(429, 'too many requests', { 'Retry-After': String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))) })
}

export function warmed(request: Request, warm: () => void): Response {
  const limited = rateLimited(request, 'warm', { limit: 20, windowMs: 60_000 })
  if (limited) return limited
  warm()
  return new Response(null, { status: 204, headers: NO_STORE })
}

export function deadline(request: Request, ms: number): AbortSignal {
  return AbortSignal.any([request.signal, AbortSignal.timeout(ms)])
}

export async function readCapped(request: Request, maxBytes: number): Promise<Uint8Array | 'too-large' | null> {
  const declared = Number(request.headers.get('content-length') ?? NaN)
  if (Number.isFinite(declared) && declared > maxBytes) return 'too-large'
  if (!request.body) return new Uint8Array()
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        void reader.cancel().catch(() => {})
        return 'too-large'
      }
      chunks.push(value)
    }
  } catch {
    return null
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

export async function readJson(request: Request, maxBytes: number): Promise<{ value: unknown } | Response> {
  const type = request.headers.get('content-type') ?? ''
  if (type && !/^(application\/json|text\/plain)\b/i.test(type)) return fail(415, 'expected json')
  const bytes = await readCapped(request, maxBytes)
  if (bytes === 'too-large') return fail(413, 'body too large')
  if (!bytes) return fail(400, 'unreadable body')
  try {
    return { value: JSON.parse(new TextDecoder().decode(bytes)) as unknown }
  } catch {
    return fail(400, 'invalid json')
  }
}
