import { LIMITS } from '../../eilo/limits'
import { lanAddress } from '../../eilo/network'
import { parseSynced } from '../../eilo/sync-schema'
import { fail, rateLimited, readJson } from '../../eilo/http'

export const dynamic = 'force-dynamic'

type Listener = (data: string) => void

const MAX_LISTENERS = 24
const MAX_ROOMS = 32
const REPLAY_MS = 10_000

type Hub = { last: string | null; lastAt?: number; listeners: Set<Listener> }
const globalHub = globalThis as unknown as { pitchHub?: Hub; pitchRooms?: Map<string, Hub> }
const rooms = (globalHub.pitchRooms ??= new Map([['', (globalHub.pitchHub ??= { last: null, listeners: new Set() })]]))

function roomOf(request: Request): string | null {
  const room = new URL(request.url).searchParams.get('sala') ?? ''
  return room === '' || /^[a-z0-9-]{1,24}$/.test(room) ? room : null
}

function hubFor(room: string): Hub | null {
  const found = rooms.get(room)
  if (found) return found
  if (rooms.size >= MAX_ROOMS) {
    for (const [name, hub] of rooms) if (name && hub.listeners.size === 0 && Date.now() - (hub.lastAt ?? 0) > REPLAY_MS) rooms.delete(name)
    if (rooms.size >= MAX_ROOMS) return null
  }
  const created: Hub = { last: null, listeners: new Set() }
  rooms.set(room, created)
  return created
}

function listening(): number {
  let total = 0
  for (const hub of rooms.values()) total += hub.listeners.size
  return total
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.has('info')) {
    const ip = lanAddress()
    return Response.json({ phone: ip ? `${url.protocol}//${ip}:${url.port}/pitch/celular` : null })
  }
  const limited = rateLimited(request, 'sync-get', { limit: 30, windowMs: 60_000 })
  if (limited) return limited
  const room = roomOf(request)
  const hub = room === null ? null : hubFor(room)
  if (!hub) return fail(400, 'invalid room')
  if (listening() >= MAX_LISTENERS) return fail(503, 'too many listeners')

  const encoder = new TextEncoder()
  let listener: Listener = () => {}
  let ping: ReturnType<typeof setInterval>
  const stream = new ReadableStream({
    start(controller) {
      const drop = () => {
        clearInterval(ping)
        hub.listeners.delete(listener)
      }
      listener = data => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          drop()
        }
      }
      hub.listeners.add(listener)
      if (hub.last && Date.now() - (hub.lastAt ?? 0) < REPLAY_MS) listener(hub.last)
      ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          drop()
        }
      }, 15_000)
      request.signal.addEventListener('abort', () => {
        drop()
        try {
          controller.close()
        } catch {}
      })
    },
    cancel() {
      clearInterval(ping)
      hub.listeners.delete(listener)
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' }
  })
}

export async function POST(request: Request) {
  const limited = rateLimited(request, 'sync-post', { limit: 900, windowMs: 60_000 })
  if (limited) return limited
  const body = await readJson(request, LIMITS.syncBodyBytes)
  if (body instanceof Response) return body
  const demo = parseSynced(body.value)
  if (!demo) return fail(422, 'invalid payload')
  const room = roomOf(request)
  const hub = room === null ? null : hubFor(room)
  if (!hub) return fail(400, 'invalid room')
  const data = JSON.stringify(demo)
  hub.last = data
  hub.lastAt = Date.now()
  hub.listeners.forEach(send => send(data))
  return Response.json({ listeners: hub.listeners.size }, { headers: { 'Cache-Control': 'no-store' } })
}
