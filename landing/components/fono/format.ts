import type { EventChannel, EventOrigin, TargetState } from './api'
import type { NodeKind } from './names'

const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_MS = 5 * 60 * 1000

export function formatLevel(level: number | null | undefined): string {
  return level == null ? '—' : decimal.format(level)
}

export function formatSeconds(ms: number | null | undefined): string {
  return ms == null ? '—' : `${decimal.format(ms / 1000)} s`
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDay(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === now.toDateString()) return 'hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'ontem'
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export function formatAgo(iso: string | null, now = Date.now()): string {
  if (!iso) return 'sem eventos'
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
  if (seconds < 60) return 'agora há pouco'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return `há ${Math.round(hours / 24)} d`
}

export function isRecent(iso: string | null, now: number) {
  return iso != null && now - Date.parse(iso) < RECENT_MS
}

export function formatSpan(ms: number): string {
  const days = Math.floor(ms / DAY_MS)
  if (days < 1) return 'desde hoje'
  if (days < 14) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  if (days < 60) return `há ${Math.floor(days / 7)} semanas`
  return `há ${Math.floor(days / 30)} meses`
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

export const ORIGIN_LABEL: Record<EventOrigin, string> = {
  model: 'IA',
  cache: 'memória',
  deterministic: 'regra fixa'
}

export const CHANNEL_LABEL: Record<EventChannel, string | null> = {
  phone: 'celular',
  earbuds: 'fone',
  watch: 'relógio',
  none: null
}

export const STATE_LABEL: Record<TargetState, string> = {
  unaided: 'sai sozinha',
  one_rung: 'com uma pista',
  full_ladder: 'escada inteira'
}

export const KIND_LABEL: Record<NodeKind, string> = {
  person: 'pessoa',
  place: 'lugar',
  object: 'objeto',
  event: 'evento'
}
