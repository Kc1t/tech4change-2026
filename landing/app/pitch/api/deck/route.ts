import { randomBytes, timingSafeEqual } from 'node:crypto'
import { parseDeckCommand, parseDeckState, type Presence } from '../../eilo/deck-schema'
import { fail, ok, rateLimited, readJson } from '../../eilo/http'
import { isLocalRequest, lanAddress } from '../../eilo/network'

export const dynamic = 'force-dynamic'

type Role = keyof Presence
type Listener = { role: Role; session: string | null; send: (event: string, data: string) => void }
type Hub = { code: string; state: string | null; stateAt: number; listeners: Set<Listener>; activeDeck: Listener | null; commands: number }

const ROLES = new Set<string>(['deck', 'remote', 'phone'])
const MAX_LISTENERS = 24
const STATE_REPLAY_MS = 60_000
const PING_MS = 15_000
const BODY_BYTES = 2_048
const CODE_PATTERN = /^[a-z0-9-]{6,40}$/i
const SESSION_PATTERN = /^[a-f0-9-]{36}$/i
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels'
const REMOTE_PATH = '/pitch/controle'

const globalHub = globalThis as unknown as { pitchDeck?: Hub }
const hub = (globalHub.pitchDeck ??= { code: randomBytes(5).toString('hex'), state: null, stateAt: 0, listeners: new Set(), activeDeck: null, commands: 0 })

function controlCode(): string {
  const configured = process.env.PITCH_CONTROL_CODE?.trim() ?? ''
  return CODE_PATTERN.test(configured) ? configured : hub.code
}

function presence(): Presence {
  const tally: Presence = { deck: 0, remote: 0, phone: 0 }
  for (const listener of hub.listeners) tally[listener.role] += 1
  return tally
}

function broadcast(event: string, data: string, roles?: Role[]) {
  for (const listener of hub.listeners) if (!roles || roles.includes(listener.role)) listener.send(event, data)
}

function announcePresence() {
  broadcast('presence', JSON.stringify(presence()), ['deck', 'remote'])
}

function codeMatches(value: unknown): boolean {
  const code = controlCode()
  if (typeof value !== 'string' || value.length !== code.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(code))
}

async function tunnelOrigin(): Promise<string | null> {
  const configured = process.env.PITCH_PUBLIC_URL?.trim().replace(/\/+$/, '')
  if (configured && /^https:\/\/[^\s/]+$/.test(configured)) return configured
  try {
    const response = await fetch(NGROK_API, { signal: AbortSignal.timeout(800) })
    const data = (await response.json()) as { tunnels?: Array<{ public_url?: unknown }> }
    const url = data.tunnels?.map(tunnel => tunnel.public_url).find(value => typeof value === 'string' && value.startsWith('https://'))
    return typeof url === 'string' ? url : null
  } catch {
    return null
  }
}

async function info(request: Request): Promise<Response> {
  if (!isLocalRequest(request)) return fail(403, 'local only')
  const url = new URL(request.url)
  const code = controlCode()
  const path = `${REMOTE_PATH}?c=${code}`
  const ip = lanAddress()
  const origin = await tunnelOrigin()
  return ok({ code, lan: ip ? `${url.protocol}//${ip}:${url.port}${path}` : null, public: origin ? `${origin}${path}` : null })
}

function subscribe(request: Request, role: Role, session: string | null): Response {
  const encoder = new TextEncoder()
  let listener: Listener | null = null
  let ping: ReturnType<typeof setInterval> | undefined
  const drop = () => {
    clearInterval(ping)
    if (listener && hub.listeners.delete(listener)) {
      if (hub.activeDeck === listener) {
        hub.activeDeck = [...hub.listeners].reverse().find(item => item.role === 'deck') ?? null
      }
      announcePresence()
    }
  }
  const stream = new ReadableStream({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          drop()
        }
      }
      listener = { role, session, send: (event, data) => write(`event: ${event}\ndata: ${data}\n\n`) }
      hub.listeners.add(listener)
      if (role === 'deck') hub.activeDeck = listener
      if (hub.state && Date.now() - hub.stateAt < STATE_REPLAY_MS) listener.send('state', hub.state)
      announcePresence()
      ping = setInterval(() => write(': ping\n\n'), PING_MS)
      request.signal.addEventListener('abort', () => {
        drop()
        try {
          controller.close()
        } catch {}
      })
    },
    cancel: drop
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' }
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.has('info')) return info(request)
  const role = url.searchParams.get('role') ?? ''
  if (!ROLES.has(role)) return fail(400, 'invalid role')
  const session = role === 'deck' ? url.searchParams.get('session') : null
  if (role === 'deck' && (!session || !SESSION_PATTERN.test(session))) return fail(400, 'invalid session')
  if (role === 'deck' && !codeMatches(url.searchParams.get('code'))) return fail(403, 'invalid code')
  const limited = rateLimited(request, 'deck-get', { limit: 60, windowMs: 60_000 })
  if (limited) return limited
  if (hub.listeners.size >= MAX_LISTENERS) return fail(503, 'too many listeners')
  return subscribe(request, role as Role, session)
}

export async function POST(request: Request) {
  const limited = rateLimited(request, 'deck-post', { limit: 600, windowMs: 60_000 })
  if (limited) return limited
  const body = await readJson(request, BODY_BYTES)
  if (body instanceof Response) return body
  const raw = body.value && typeof body.value === 'object' ? (body.value as Record<string, unknown>) : {}
  if (!codeMatches(raw.code)) return fail(403, 'invalid code')
  if (raw.state !== undefined) {
    if (typeof raw.session !== 'string' || hub.activeDeck?.session !== raw.session) return fail(409, 'inactive deck')
    const state = parseDeckState(raw.state)
    if (!state) return fail(422, 'invalid state')
    hub.state = JSON.stringify(state)
    hub.stateAt = Date.now()
    broadcast('state', hub.state)
    return ok(presence())
  }
  const command = parseDeckCommand(raw.command)
  if (!command) return fail(422, 'invalid command')
  hub.commands += 1
  hub.activeDeck?.send('command', JSON.stringify({ ...command, id: hub.commands }))
  return ok(presence())
}
