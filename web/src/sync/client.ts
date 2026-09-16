import type { NodeId } from '@/domain/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const HEARTBEAT_MS = 20_000

export type DeviceKind = 'phone' | 'watch' | 'earbuds' | 'desktop'

export interface Device {
  id: string
  kind: DeviceKind
  name: string
  joinedAt: number
  seenAt: number
}

export interface CuePayload {
  deviceId: string
  targetId: NodeId
  level: number
  attr: string
  edge: string | null
  isFinal: boolean
  event: 'cue' | 'resolved'
}

export type SyncEvent =
  | { type: 'devices'; devices: Device[] }
  | { type: 'cue'; from: string; cue: CuePayload }

export function syncAvailable(): boolean {
  return BASE.length > 0
}

export function describeDevice(): { kind: DeviceKind; name: string } {
  const ua = navigator.userAgent
  const coarse = window.matchMedia('(pointer: coarse)').matches

  if (/Android/i.test(ua)) {
    const model = /Android[^;)]*;\s*([^;)]+)/.exec(ua)?.[1]?.trim() ?? ''
    const clean = model.replace(/\s+Build.*$/i, '').replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 32)
    return { kind: 'phone', name: clean || 'Celular' }
  }

  if (/iPhone|iPad|iPod/i.test(ua)) return { kind: 'phone', name: 'iPhone' }
  if (coarse) return { kind: 'phone', name: 'Celular' }
  return { kind: 'desktop', name: 'Computador' }
}

async function send<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!BASE) return null
  try {
    const response = await fetch(`${BASE}/v1/sync${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers }
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function createSession(): Promise<{ code: string } | null> {
  return send<{ code: string }>('/sessions', { method: 'POST' })
}

export function joinSession(
  code: string,
  device: { kind: DeviceKind; name: string }
): Promise<Device | null> {
  return send<Device>(`/sessions/${code}/devices`, {
    method: 'POST',
    body: JSON.stringify(device)
  })
}

export function leaveSession(code: string, deviceId: string): void {
  if (!BASE) return
  const url = `${BASE}/v1/sync/sessions/${code}/devices/${deviceId}`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([], { type: 'application/json' }))
    return
  }
  void fetch(url, { method: 'DELETE', keepalive: true }).catch(() => undefined)
}

export function broadcastCue(code: string, cue: CuePayload): void {
  void send(`/sessions/${code}/cue`, { method: 'POST', body: JSON.stringify(cue) })
}

export function subscribe(
  code: string,
  deviceId: string,
  onEvent: (event: SyncEvent) => void
): () => void {
  if (!BASE) return () => undefined

  const source = new EventSource(`${BASE}/v1/sync/sessions/${code}/stream`)
  source.onmessage = message => {
    try {
      onEvent(JSON.parse(message.data) as SyncEvent)
    } catch {
      return
    }
  }

  const beat = window.setInterval(() => {
    void send(`/sessions/${code}/devices/${deviceId}/heartbeat`, { method: 'POST' })
  }, HEARTBEAT_MS)

  return () => {
    source.close()
    window.clearInterval(beat)
  }
}
