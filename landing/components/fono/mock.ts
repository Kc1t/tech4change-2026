import type { AuditEvent, EventChannel, SubjectRow, Summary } from './api'
import { stateFor } from './derive'
import { nodeId, type NodeKind } from './names'

export const DEMO_SUBJECT = 'subject_demo_helena'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS
const DAYS = 28

const WORDS: Array<{ label: string; kind: NodeKind; from: number; to: number; chance: number }> = [
  { label: 'escumadeira', kind: 'object', from: 3.7, to: 2.4, chance: 0.75 },
  { label: 'Sorocaba', kind: 'place', from: 3.1, to: 1.5, chance: 0.8 },
  { label: 'Letícia', kind: 'person', from: 2.7, to: 0.9, chance: 0.9 },
  { label: 'almoço de domingo', kind: 'event', from: 2.2, to: 0.3, chance: 0.55 }
]

const CHANNELS: EventChannel[] = ['phone', 'phone', 'phone', 'watch', 'earbuds']

function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function average(values: number[]) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
}

function summarise(events: AuditEvent[]): Summary {
  const resolved = events.filter(event => event.event === 'resolved')
  const origin = Math.min(...resolved.map(event => Date.parse(event.occurredAt)))
  const weeks = new Map<number, number[]>()
  const targets = new Map<string, number[]>()
  for (const event of resolved) {
    const week = Math.floor((Date.parse(event.occurredAt) - origin) / WEEK_MS)
    weeks.set(week, [...(weeks.get(week) ?? []), event.level])
    targets.set(event.targetId, [...(targets.get(event.targetId) ?? []), event.level])
  }
  return {
    subject: DEMO_SUBJECT,
    attempts: resolved.length,
    averageLevel: average(resolved.map(event => event.level)),
    trend: [...weeks.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, levels]) => ({ week: week + 1, averageLevel: average(levels), attempts: levels.length })),
    targets: [...targets.entries()]
      .map(([targetId, levels]) => {
        const averageLevel = average(levels)
        return { targetId, averageLevel, attempts: levels.length, state: stateFor(averageLevel) }
      })
      .sort((a, b) => b.averageLevel - a.averageLevel),
    blocks: events.filter(event => event.event === 'block').length
  }
}

export async function demoSnapshot(now: number) {
  const next = random(24)
  const ids = await Promise.all(WORDS.map(word => nodeId(word.label, word.kind)))
  const events: AuditEvent[] = []
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  for (let day = DAYS - 1; day >= 0; day -= 1) {
    const progress = (DAYS - 1 - day) / (DAYS - 1)
    WORDS.forEach((word, index) => {
      if (next() > word.chance) return
      const ideal = word.from - (word.from - word.to) * progress + (next() - 0.5) * 0.8
      const level = Math.max(0, Math.min(4, Math.round(ideal)))
      const start =
        day === 0
          ? now - (index + 1) * (35 + next() * 20) * 60_000
          : today.getTime() - day * DAY_MS + (9 + next() * 11) * 3_600_000
      const channel = CHANNELS[Math.floor(next() * CHANNELS.length)]
      const origin = next() < 0.06 ? 'deterministic' : 'model'
      const base = { subject: DEMO_SUBJECT, targetId: ids[index], origin, channel } as const
      const at = (offset: number) => new Date(start + offset).toISOString()

      events.push({ ...base, event: 'block', level: 0, elapsedMs: 0, occurredAt: at(0) })
      for (let step = 1; step <= level; step += 1) {
        events.push({ ...base, event: 'step', level: step, elapsedMs: step * 1600, occurredAt: at(step * 1600) })
      }
      const elapsed = Math.round(1400 + level * 1500 + next() * 900)
      const gaveUp = level === 4 && next() < 0.3
      events.push({
        ...base,
        event: gaveUp ? 'abandoned' : 'resolved',
        level,
        elapsedMs: elapsed,
        occurredAt: at(elapsed)
      })
    })
  }

  events.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
  const subjects: SubjectRow[] = [
    { subject: DEMO_SUBJECT, lastSeen: events[0]?.occurredAt ?? null, events: events.length }
  ]
  return { subjects, subject: DEMO_SUBJECT, summary: summarise(events), events }
}
