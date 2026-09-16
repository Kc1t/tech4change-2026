import { Platform } from 'react-native'
import Constants from 'expo-constants'
import type { NodeId } from '../domain/types'

const API_PORT = 3333

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
  | { type: 'closed' }

export function apiBase(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const host = Constants.expoConfig?.hostUri?.split(':')[0]
  if (host) return `http://${host}:${API_PORT}`

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${apiBase()}/v1/sync${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers }
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function describeDevice(): { kind: DeviceKind; name: string } {
  return { kind: 'phone', name: Platform.OS === 'android' ? 'Celular Android' : 'iPhone' }
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
  void call(`/sessions/${code}/devices/${deviceId}/heartbeat`, { method: 'POST' })
}

export function broadcastCue(code: string, cue: CuePayload): void {
  void call(`/sessions/${code}/cue`, { method: 'POST', body: JSON.stringify(cue) })
}

export function pollEvents(
  code: string,
  after: number
): Promise<{ seq: number; events: SyncEvent[] } | null> {
  return call<{ seq: number; events: SyncEvent[] }>(`/sessions/${code}/events?after=${after}`)
}
