import type { AuditEvent, Summary, TargetState } from './api'
import { formatLevel } from './format'

export type Period = 'week' | 'month' | 'all'

export const PERIOD_LABEL: Record<Period, string> = {
  week: 'Esta semana',
  month: '4 semanas',
  all: 'Tudo'
}

const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_DAYS: Record<Period, number | null> = { week: 7, month: 28, all: null }
const SPARK_POINTS = 8

export interface Window {
  from: number
  previousFrom: number | null
}

export interface PeriodStats {
  resolved: number
  averageLevel: number | null
  blocks: number
  averageElapsed: number | null
  abandoned: number
}

export interface WordRow {
  targetId: string
  attempts: number
  averageLevel: number
  state: TargetState
  levels: number[]
  abandoned: number
  lastAt: number
}

export interface Kpis {
  current: PeriodStats
  previous: PeriodStats | null
  levelNow: number | null
  levelBefore: number | null
  compareLabel: string
}

export function stateFor(level: number): TargetState {
  if (level <= 0.5) return 'unaided'
  if (level <= 2) return 'one_rung'
  return 'full_ladder'
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function timeOf(event: AuditEvent) {
  return Date.parse(event.occurredAt)
}

export function windowFor(period: Period, now: number): Window {
  const days = PERIOD_DAYS[period]
  if (days == null) return { from: -Infinity, previousFrom: null }
  const from = now - days * DAY_MS
  return { from, previousFrom: from - days * DAY_MS }
}

export function inWindow(events: AuditEvent[], from: number, to = Infinity) {
  return events.filter(event => {
    const at = timeOf(event)
    return at >= from && at < to
  })
}

export function statsOf(events: AuditEvent[]): PeriodStats {
  const resolved = events.filter(event => event.event === 'resolved')
  return {
    resolved: resolved.length,
    averageLevel: average(resolved.map(event => event.level)),
    blocks: events.filter(event => event.event === 'block').length,
    averageElapsed: average(resolved.map(event => event.elapsedMs)),
    abandoned: events.filter(event => event.event === 'abandoned').length
  }
}

export function kpisFor(
  events: AuditEvent[],
  summary: Summary | null,
  period: Period,
  now: number
): Kpis {
  const { from, previousFrom } = windowFor(period, now)
  const current = statsOf(inWindow(events, from))

  if (previousFrom == null) {
    const trend = summary?.trend ?? []
    const first = trend[0]
    const last = trend.at(-1)
    return {
      current: {
        ...current,
        averageLevel: summary?.averageLevel ?? current.averageLevel,
        blocks: Math.max(summary?.blocks ?? 0, current.blocks)
      },
      previous: null,
      levelNow: last?.averageLevel ?? summary?.averageLevel ?? current.averageLevel,
      levelBefore: trend.length >= 2 && first ? first.averageLevel : null,
      compareLabel: 'desde a 1ª semana'
    }
  }

  const previousEvents = inWindow(events, previousFrom, from)
  const previous = previousEvents.length > 0 ? statsOf(previousEvents) : null
  return {
    current,
    previous,
    levelNow: current.averageLevel,
    levelBefore: previous?.averageLevel ?? null,
    compareLabel: period === 'week' ? 'vs. semana anterior' : 'vs. 4 semanas anteriores'
  }
}

export function wordRows(events: AuditEvent[], from: number): WordRow[] {
  const byTarget = new Map<string, AuditEvent[]>()
  for (const event of inWindow(events, from)) {
    if (event.event !== 'resolved' && event.event !== 'abandoned') continue
    byTarget.set(event.targetId, [...(byTarget.get(event.targetId) ?? []), event])
  }

  return [...byTarget.entries()]
    .map(([targetId, list]) => {
      const chronological = [...list].sort((a, b) => timeOf(a) - timeOf(b))
      const levels = chronological
        .filter(event => event.event === 'resolved')
        .map(event => event.level)
      const averageLevel = average(levels)
      return {
        targetId,
        attempts: levels.length,
        averageLevel: averageLevel ?? 0,
        state: stateFor(averageLevel ?? 99),
        levels: levels.slice(-SPARK_POINTS),
        abandoned: list.length - levels.length,
        lastAt: timeOf(chronological[chronological.length - 1])
      }
    })
    .sort(byNeed)
}

function byNeed(a: WordRow, b: WordRow) {
  const need = (row: WordRow) => (row.attempts > 0 ? row.averageLevel : -1)
  return need(b) - need(a) || b.attempts - a.attempts
}

export function withSummaryTargets(rows: WordRow[], summary: Summary | null): WordRow[] {
  if (!summary || summary.targets.length === 0) return rows
  const byId = new Map(rows.map(row => [row.targetId, row]))
  const merged = summary.targets.map(target => {
    const row = byId.get(target.targetId)
    byId.delete(target.targetId)
    return {
      targetId: target.targetId,
      attempts: target.attempts,
      averageLevel: target.averageLevel,
      state: target.state,
      levels: row?.levels ?? [],
      abandoned: row?.abandoned ?? 0,
      lastAt: row?.lastAt ?? 0
    }
  })
  return [...merged, ...byId.values()].sort(byNeed)
}

export function followingFor(events: AuditEvent[], summary: Summary | null, now: number) {
  const oldest = events.at(-1)
  const fromEvents = oldest ? now - timeOf(oldest) : 0
  const weeks = summary?.trend.at(-1)?.week ?? 0
  const fromTrend = Math.max(0, weeks - 1) * 7 * DAY_MS
  return Math.max(fromEvents, fromTrend)
}

export function freshTargets(events: AuditEvent[], fresh: Set<string>) {
  return new Set(events.filter(event => fresh.has(eventKey(event))).map(event => event.targetId))
}

export function eventKey(event: AuditEvent) {
  return `${event.occurredAt}|${event.targetId}|${event.event}|${event.level}`
}

export interface Suggestion {
  id: string
  tone: 'work' | 'progress' | 'calm' | 'attention'
  text: string
}

export function suggestionsFor(
  words: WordRow[],
  kpis: Kpis,
  weekStats: PeriodStats,
  previousWeekStats: PeriodStats | null,
  nameOf: (targetId: string) => string | null
): Suggestion[] {
  const list: Suggestion[] = []
  const covered = new Set<string>()
  const wordFor = (targetId: string) => {
    const name = nameOf(targetId) ?? 'Uma palavra protegida'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  for (const row of words) {
    const fullLadderRuns = row.levels.slice(-3).filter(level => level >= 3).length
    if (row.attempts < 2 || fullLadderRuns < 2) continue
    covered.add(row.targetId)
    list.push({
      id: `work-${row.targetId}`,
      tone: 'work',
      text: `${wordFor(row.targetId)} ainda precisa da escada inteira: vale trabalhar em sessão.`
    })
  }

  for (const row of words) {
    if (row.abandoned < 2 || covered.has(row.targetId)) continue
    covered.add(row.targetId)
    list.push({
      id: `attention-${row.targetId}`,
      tone: 'attention',
      text: `${wordFor(row.targetId)} ficou sem sair ${row.abandoned} vezes: talvez valha rever as pistas dela.`
    })
  }

  for (const row of words) {
    if (row.levels.length < 2 || covered.has(row.targetId)) continue
    const half = Math.floor(row.levels.length / 2)
    const before = average(row.levels.slice(0, half)) ?? 0
    const after = average(row.levels.slice(half)) ?? 0
    const last = row.levels.at(-1) ?? 99
    if (before - after < 0.75 || last > 2) continue
    list.push({
      id: `progress-${row.targetId}`,
      tone: 'progress',
      text:
        last === 0
          ? `${wordFor(row.targetId)} já saiu sozinha: dá para espaçar o treino dela.`
          : `${wordFor(row.targetId)} já sai com ${last === 1 ? 'uma pista' : 'menos pistas'}: dá para começar pela pista mais leve.`
    })
  }

  if (
    kpis.levelNow != null &&
    kpis.levelBefore != null &&
    kpis.levelBefore - kpis.levelNow >= 0.3
  ) {
    list.push({
      id: 'level-down',
      tone: 'progress',
      text: `Nesta semana, o degrau médio caiu de ${formatLevel(kpis.levelBefore)} para ${formatLevel(kpis.levelNow)}: vale contar isso ao paciente.`
    })
  }

  if (previousWeekStats && weekStats.blocks >= previousWeekStats.blocks + 3) {
    list.push({
      id: 'more-blocks',
      tone: 'attention',
      text: 'Mais travamentos que na semana anterior: vale perguntar como foi a semana.'
    })
  } else if (weekStats.blocks === 0) {
    list.push({
      id: 'quiet',
      tone: 'calm',
      text: 'Nenhum travamento registrado nesta semana: vale confirmar se o app está sendo usado.'
    })
  } else if (weekStats.blocks <= 3) {
    list.push({
      id: 'calm',
      tone: 'calm',
      text: 'Semana tranquila: poucos travamentos fora da sessão.'
    })
  }

  const order: Suggestion['tone'][] = ['work', 'attention', 'progress', 'calm']
  return list.sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone)).slice(0, 4)
}
