import type { Activity, DemoCue, LiveDemoState } from '../demo/types'
import type { SyncedDemo } from '../sync'
import { parseLevel } from './guess-safety'
import { LIMITS } from './limits'
import { cleanTranscript, maskOffensive } from './text-safety'

const PHASES = new Set(['idle', 'cue', 'success', 'given'])
const MICS = new Set(['off', 'listening', 'unsupported', 'blocked', 'simulating'])
const CUE_ORIGINS = new Set(['offline', 'model', 'cache', 'deterministic', 'openrouter'])
const ACTIVITIES = new Set<Activity>(['off', 'waiting', 'listening', 'hearing', 'thinking', 'helping', 'recalled'])

function syncText(value: unknown, max: number): string {
  return maskOffensive(cleanTranscript(value, max, 40))
}

export function parseSynced(value: unknown): SyncedDemo | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const cue = raw.cue && typeof raw.cue === 'object' ? (raw.cue as Record<string, unknown>) : null
  if (!cue || typeof cue.phase !== 'string' || !PHASES.has(cue.phase)) return null
  if (typeof raw.mic !== 'string' || !MICS.has(raw.mic)) return null
  const at = typeof raw.at === 'number' && Number.isFinite(raw.at) ? raw.at : null
  if (at === null) return null
  const level = parseLevel(cue.level) ?? 0
  const total = parseLevel(cue.total) ?? 0
  const parsed: DemoCue = { phase: cue.phase as DemoCue['phase'], level, total, text: syncText(cue.text, LIMITS.syncText) }
  if (typeof cue.kind === 'string' && /^[a-z]{1,20}$/.test(cue.kind)) parsed.kind = cue.kind
  if (typeof cue.origin === 'string' && CUE_ORIGINS.has(cue.origin)) parsed.origin = cue.origin as DemoCue['origin']
  if (cue.targetBy === 'openrouter' || cue.targetBy === 'offline') parsed.targetBy = cue.targetBy
  if (cue.network === 'online' || cue.network === 'offline') parsed.network = cue.network
  const words = (Array.isArray(raw.words) ? raw.words.slice(-LIMITS.syncWords) : [])
    .map(word => syncText(word, LIMITS.syncWordChars))
    .filter(Boolean)
  const activity = typeof raw.activity === 'string' && ACTIVITIES.has(raw.activity as Activity) ? (raw.activity as Activity) : undefined
  return { cue: parsed, words, mic: raw.mic as LiveDemoState['mic'], activity, at }
}
