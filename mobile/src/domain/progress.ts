import type { Resolution } from './types'

const WINDOW = 5
const AUTONOMY_WINDOW = 8
const SMOOTH = 4

export interface Progress {
  attempts: number
  average: number | null
  previous: number | null
  autonomy: number | null
  series: number[]
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function share(levels: number[]): number {
  return (levels.filter(level => level <= 1).length / levels.length) * 100
}

function smooth(values: number[], window = SMOOTH): number[] {
  if (values.length < 2) return values
  return values.map(
    (_, index) => mean(values.slice(Math.max(0, index - window + 1), index + 1))!
  )
}

export function autonomySeries(levels: number[], window = AUTONOMY_WINDOW): number[] {
  return smooth(
    levels.map((_, index) => share(levels.slice(Math.max(0, index - window + 1), index + 1)))
  )
}

export function summarise(history: Resolution[]): Progress {
  const levels = history.map(entry => entry.level)
  const recent = levels.slice(-WINDOW)
  const before = levels.slice(-WINDOW * 2, -WINDOW)

  return {
    attempts: history.length,
    average: mean(recent),
    previous: before.length >= 2 ? mean(before) : null,
    autonomy: recent.length > 0 ? share(recent) : null,
    series: autonomySeries(levels)
  }
}

export function formatLevel(value: number): string {
  return value.toFixed(1).replace('.', ',')
}
