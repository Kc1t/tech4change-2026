import { Platform } from 'react-native'
import Constants from 'expo-constants'
import type { NodeId } from '../domain/types'

const API_PORT = 3333
const SYNC_TIMEOUT_MS = 3000
const SESSION_GONE_STATUS = 404

export type DeviceKind = 'phone' | 'watch' | 'earbuds' | 'desktop'

export interface Device {
  id: string
  kind: DeviceKind
  name: string
  joinedAt: number
  seenAt: number
  battery: number | null
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
  | { type: 'closed' }

export interface EventPage {
  seq: number
  events: SyncEvent[]
}

export function apiBase(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const host = Constants.expoConfig?.hostUri?.split(':')[0]
  if (host) return `http://${host}:${API_PORT}`

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`
}

interface Reply<T> {
  status: number
  body: T | null
}

async function request<T>(path: string, init?: RequestInit): Promise<Reply<T> | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiBase()}/v1/sync${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'content-type': 'application/json', ...init?.headers }
    })
    const body = response.ok ? ((await response.json()) as T) : null
    return { status: response.status, body }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  return (await request<T>(path, init))?.body ?? null
}

export function describeDevice(): { kind: DeviceKind; name: string } {
  return { kind: 'phone', name: Platform.OS === 'android' ? 'Celular Android' : 'iPhone' }
}

export async function discoverSession(): Promise<string | null> {
  const open = await call<{ code: string | null }>('/sessions/open')
  return open?.code ?? null
}

export function createSession(): Promise<{ code: string } | null> {
  return call<{ code: string }>('/sessions', { method: 'POST' })
}

export function joinSession(
  code: string,
  device: { kind: DeviceKind; name: string }
): Promise<Device | null> {
  return call<Device>(`/sessions/${code}/devices`, {
    method: 'POST',
    body: JSON.stringify(device)
  })
}

export function leaveSession(code: string, deviceId: string): void {
  void call(`/sessions/${code}/devices/${deviceId}`, { method: 'DELETE' })
}

export function heartbeat(code: string, deviceId: string): void {
  void call(`/sessions/${code}/devices/${deviceId}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify({})
  })
}

export function broadcastCue(code: string, cue: CuePayload): void {
  void call(`/sessions/${code}/cue`, { method: 'POST', body: JSON.stringify(cue) })
}

export async function pollEvents(code: string, after: number): Promise<EventPage | 'gone' | null> {
  const reply = await request<EventPage>(`/sessions/${code}/events?after=${after}`)
  if (reply?.status === SESSION_GONE_STATUS) return 'gone'
  return reply?.body ?? null
}
