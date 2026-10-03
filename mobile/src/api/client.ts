import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiBase } from '../sync/client'
import type { Seed } from '../domain/seed'
import type { CuePlan, GraphProjection, NodeId, NodeKind } from '../domain/types'

const REQUEST_TIMEOUT_MS = 3000
const ONBOARDING_TIMEOUT_MS = 7000
const SUBJECT_KEY = 'subject-id'

let subject: Promise<string> | null = null

async function loadSubject(): Promise<string> {
  const stored = await AsyncStorage.getItem(SUBJECT_KEY).catch(() => null)
  if (stored) return stored
  const fresh = `subject_${Math.random().toString(36).slice(2, 12)}`
  await AsyncStorage.setItem(SUBJECT_KEY, fresh).catch(() => undefined)
  return fresh
}

export function subjectId(): Promise<string> {
  subject ??= loadSubject()
  return subject
}

async function send<T>(path: string, body: object, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${apiBase()}/v1${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject: await subjectId(), ...body })
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
  return send<CuePlan>('/cue/rank', request)
}

export type AuditChannel = 'phone' | 'earbuds' | 'watch' | 'none'

export interface AuditEvent {
  targetId: NodeId
  event: 'block' | 'step' | 'resolved' | 'abandoned'
  level: number
  origin: CuePlan['origin']
  channel: AuditChannel
  elapsedMs: number
  occurredAt?: string
}

export function recordEvent(event: AuditEvent): void {
  void send('/audit/events', { ...event, occurredAt: event.occurredAt ?? new Date().toISOString() })
}

export function onboardingTurn(request: { message: string; asked: string; known: Partial<Seed> }) {
  return send<{ answers: Partial<Seed>; reply: string }>('/onboarding/turn', request, ONBOARDING_TIMEOUT_MS)
}
