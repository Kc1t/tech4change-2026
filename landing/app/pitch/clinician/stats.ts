import { PERIOD_FROM, WEEKS, type FeedEvent, type Period, type State, type Word } from './data'

const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatLevel(value: number | null) {
  return value == null ? '—' : decimal.format(value)
}

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h === 0 ? `${m} min` : `${h} h ${String(m).padStart(2, '0')}`
}

export function stateFor(level: number): State {
  if (level <= 0.5) return 'unaided'
  if (level <= 2) return 'one_rung'
  return 'full_ladder'
}

function normalise(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function findWord(words: Word[], label: string) {
  const wanted = normalise(label)
  return words.find(word => normalise(word.label) === wanted || (word.alias && normalise(word.alias) === wanted))
}

export interface Stats {
  resolved: number
  blocks: number
  average: number | null
  elapsed: number | null
}

export function statsOf(words: Word[], from: number, to = WEEKS): Stats {
  let resolved = 0
  let sum = 0
  let abandoned = 0
  for (const word of words) {
    for (let w = from; w < to; w += 1) {
      resolved += word.attempts[w]
      sum += word.attempts[w] * word.levels[w]
      abandoned += word.gaveUp[w]
    }
  }
  const average = resolved > 0 ? sum / resolved : null
  return {
    resolved,
    blocks: resolved + abandoned,
    average,
    elapsed: average == null ? null : 1.85 + average * 1.5
  }
}

export function trendOf(words: Word[]) {
  return Array.from({ length: WEEKS }, (_, w) => {
    const stats = statsOf(words, w, w + 1)
    return { week: w + 1, level: stats.average ?? 0, attempts: stats.resolved }
  })
}

export interface Row {
  word: Word
  attempts: number
  abandoned: number
  average: number
  state: State
}

export function rowsFor(words: Word[], period: Period): Row[] {
  const from = PERIOD_FROM[period]
  return words
    .map(word => {
      const stats = statsOf([word], from)
      const abandoned = word.gaveUp.slice(from).reduce((a, b) => a + b, 0)
      return { word, attempts: stats.resolved, abandoned, average: stats.average ?? 0, state: stateFor(stats.average ?? 99) }
    })
    .sort((a, b) => b.average - a.average || b.attempts - a.attempts)
}

export type Kpis = ReturnType<typeof kpisFor>

export type TrendPoint = ReturnType<typeof trendOf>[number]

export function kpisFor(words: Word[], period: Period) {
  const from = PERIOD_FROM[period]
  const current = statsOf(words, from)
  if (period === 'all') {
    const trend = trendOf(words)
    return {
      current,
      previous: null,
      levelBefore: trend[0].level,
      levelNow: trend[WEEKS - 1].level,
      compare: 'desde a 1ª semana'
    }
  }
  const span = WEEKS - from
  const previous = statsOf(words, from - span, from)
  return {
    current,
    previous,
    levelBefore: previous.average,
    levelNow: current.average,
    compare: period === 'week' ? 'vs. semana anterior' : 'vs. 4 semanas anteriores'
  }
}

export function withLive(words: Word[], live: FeedEvent[]): Word[] {
  if (live.length === 0) return words
  const last = WEEKS - 1
  return words.map(word => {
    const mine = live.filter(event => findWord([word], event.word))
    if (mine.length === 0) return word
    const attempts = [...word.attempts]
    const levels = [...word.levels]
    const gaveUp = [...word.gaveUp]
    for (const event of mine) {
      if (event.kind === 'abandoned' || event.kind === 'given') {
        gaveUp[last] += 1
        continue
      }
      if (event.kind !== 'resolved') continue
      levels[last] = (attempts[last] * levels[last] + event.level) / (attempts[last] + 1)
      attempts[last] += 1
    }
    return { ...word, attempts, levels, gaveUp }
  })
}
