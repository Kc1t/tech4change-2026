import { cleanTranscript } from './text-safety'

export type DeckState = { index: number; total: number; title: string; next: string | null; listen: boolean; at: number }

export type DeckCommand = { action: 'next' } | { action: 'previous' } | { action: 'go'; index: number }

export type Presence = { deck: number; remote: number; phone: number }

const MAX_SLIDES = 64
const TITLE_CHARS = 60
const TITLE_WORDS = 12

function slideIndex(value: unknown, total = MAX_SLIDES): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < total ? value : null
}

function count(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 1000 ? value : null
}

function title(value: unknown): string {
  return cleanTranscript(value, TITLE_CHARS, TITLE_WORDS)
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

export function parseDeckState(value: unknown): DeckState | null {
  const raw = record(value)
  if (!raw) return null
  const total = typeof raw.total === 'number' && Number.isInteger(raw.total) && raw.total > 0 && raw.total <= MAX_SLIDES ? raw.total : null
  const index = total === null ? null : slideIndex(raw.index, total)
  const at = typeof raw.at === 'number' && Number.isFinite(raw.at) ? raw.at : null
  if (total === null || index === null || at === null || typeof raw.listen !== 'boolean') return null
  return { index, total, title: title(raw.title), next: raw.next === null ? null : title(raw.next) || null, listen: raw.listen, at }
}

export function parseDeckCommand(value: unknown): DeckCommand | null {
  const raw = record(value)
  if (!raw) return null
  if (raw.action === 'next' || raw.action === 'previous') return { action: raw.action }
  if (raw.action !== 'go') return null
  const index = slideIndex(raw.index)
  return index === null ? null : { action: 'go', index }
}

export function parsePresence(value: unknown): Presence | null {
  const raw = record(value)
  if (!raw) return null
  const deck = count(raw.deck)
  const remote = count(raw.remote)
  const phone = count(raw.phone)
  return deck === null || remote === null || phone === null ? null : { deck, remote, phone }
}
