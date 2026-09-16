import type { ClinicianSummary, CuePlan, GraphProjection, NodeId, NodeKind } from '@/domain/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const REQUEST_TIMEOUT_MS = 3000
const SUBJECT_KEY = 'subject-id'

export function subjectId(): string {
  const stored = localStorage.getItem(SUBJECT_KEY)
  if (stored) return stored
  const fresh = `subject_${Math.random().toString(36).slice(2, 12)}`
  localStorage.setItem(SUBJECT_KEY, fresh)
  return fresh
}

export function apiConfigured(): boolean {
  return BASE.length > 0
}

async function send<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!BASE) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE}/v1${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'content-type': 'application/json', ...init?.headers }
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export interface RankCueRequest {
  projection: GraphProjection
  activeNodes: NodeId[]
  hints: { kind?: NodeKind; relation?: string }
  lastLevel: number | null
}

export function rankCue(request: RankCueRequest): Promise<CuePlan | null> {
  return send<CuePlan>('/cue/rank', {
    method: 'POST',
    body: JSON.stringify({ subject: subjectId(), ...request })
  })
}

export interface AuditEvent {
  targetId: NodeId
  event: 'block' | 'step' | 'resolved' | 'abandoned'
  level: number
  origin: CuePlan['origin']
  channel: 'phone' | 'earbuds' | 'watch' | 'none'
  elapsedMs: number
}

export function recordEvent(event: AuditEvent): Promise<unknown> {
  return send('/audit/events', {
    method: 'POST',
    body: JSON.stringify({ subject: subjectId(), ...event, occurredAt: new Date().toISOString() })
  })
}

export function clinicianSummary(): Promise<ClinicianSummary | null> {
  return send<ClinicianSummary>(`/clinician/${subjectId()}/summary`)
}

export interface ConsentState {
  listening: boolean
  photos: boolean
  clinician: boolean
  research: boolean
}

export const DENIED_CONSENT: ConsentState = {
  listening: false,
  photos: false,
  clinician: false,
  research: false
}

export function readConsent(): Promise<(ConsentState & { updatedAt: string | null }) | null> {
  return send<ConsentState & { updatedAt: string | null }>(`/consent/${subjectId()}`)
}

export function writeConsent(state: ConsentState): Promise<ConsentState | null> {
  return send<ConsentState>(`/consent/${subjectId()}`, {
    method: 'PUT',
    body: JSON.stringify(state)
  })
}
