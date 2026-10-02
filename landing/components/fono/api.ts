export type TargetState = 'unaided' | 'one_rung' | 'full_ladder'
export type EventKind = 'block' | 'step' | 'resolved' | 'abandoned'
export type EventOrigin = 'model' | 'cache' | 'deterministic'
export type EventChannel = 'phone' | 'earbuds' | 'watch' | 'none'

export interface SubjectRow {
  subject: string
  lastSeen: string | null
  events: number
}

export interface WeekPoint {
  week: number
  averageLevel: number
  attempts: number
}

export interface TargetRow {
  targetId: string
  averageLevel: number
  attempts: number
  state: TargetState
}

export interface Summary {
  subject: string
  attempts: number
  averageLevel: number | null
  trend: WeekPoint[]
  targets: TargetRow[]
  blocks: number
}

export interface AuditEvent {
  subject: string
  targetId: string
  event: EventKind
  level: number
  origin: EventOrigin
  channel: EventChannel
  elapsedMs: number
  occurredAt: string
}

export const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export function resolveApiUrl(): string {
  const override = new URLSearchParams(window.location.search).get('api')
  return (override || DEFAULT_API_URL).replace(/\/+$/, '')
}

async function getJson<T>(base: string, path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${base}${path}`, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error(`${response.status} em ${path}`)
  return response.json() as Promise<T>
}

export function fetchSubjects(base: string, signal: AbortSignal) {
  return getJson<SubjectRow[]>(base, '/v1/clinician/subjects', signal)
}

export function fetchSummary(base: string, subject: string, signal: AbortSignal) {
  return getJson<Summary>(base, `/v1/clinician/${encodeURIComponent(subject)}/summary`, signal)
}

export async function fetchEvents(base: string, subject: string, signal: AbortSignal) {
  const events = await getJson<AuditEvent[]>(
    base,
    `/v1/audit/events/${encodeURIComponent(subject)}`,
    signal
  )
  return [...events].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
}
