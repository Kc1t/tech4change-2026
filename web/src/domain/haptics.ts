import { cueable, syllables } from './phonology'
import type { LearningState, Phonology } from './types'

export type HapticRung = 'nudge' | 'count' | 'rhythm' | 'onset'

export interface HapticCue {
  rung: HapticRung
  pattern: number[]
  beats: number[]
  syllables: string[]
  stress: number
  caption: string
}

const SHORT = 42
const LONG = 130
const GAP = 94
const NUDGE = 34
const ATTACK = 150
const ATTACK_GAP = 190

const ACUTE = /[áéíóúâêôà]/
const NASAL = /[ãõ]/
const OXYTONE_END = /(r|l|z|x|n|i|u|im|ins|um|uns|om|ons|ã|ãs|ão|ãos|ãe|ães)$/

export function stressOf(parts: string[]): number {
  if (parts.length <= 1) return 0

  const acute = parts.findIndex(part => ACUTE.test(part.toLowerCase()))
  if (acute >= 0) return acute

  const nasal = parts.findIndex(part => NASAL.test(part.toLowerCase()))
  if (nasal >= 0) return nasal

  const last = parts[parts.length - 1]!.toLowerCase()
  if (OXYTONE_END.test(last)) return parts.length - 1

  return parts.length - 2
}

export function beatsOf(parts: string[], stress: number): number[] {
  return parts.map((_, index) => (index === stress ? LONG : SHORT))
}

function interleave(beats: number[], gap: number): number[] {
  return beats.flatMap((beat, index) => (index === 0 ? [beat] : [gap, beat]))
}

export function durationOf(pattern: number[]): number {
  return pattern.reduce((total, value) => total + value, 0)
}

export function rungFor(learning: LearningState): HapticRung {
  if (learning.failures - learning.successes >= 2) return 'onset'
  if (learning.mastery === 'high') return 'nudge'
  if (learning.mastery === 'medium') return 'count'
  return 'rhythm'
}

const CAPTION: Record<HapticRung, string> = {
  nudge: 'um toque só — a dica vem logo atrás',
  count: 'um pulso por sílaba, no compasso da dica',
  rhythm: 'o compasso inteiro, com apoio na sílaba forte',
  onset: 'a batida de entrada, e o compasso atrás dela'
}

export function cueFor(label: string, learning: LearningState, phon?: Phonology): HapticCue {
  const parts = phon?.syllables ?? (cueable(label) ? syllables(label) : [])
  const rung = parts.length === 0 ? 'nudge' : rungFor(learning)
  const stress = stressOf(parts)

  if (rung === 'nudge') {
    return { rung, pattern: [NUDGE], beats: [NUDGE], syllables: parts, stress, caption: CAPTION.nudge }
  }

  if (rung === 'count') {
    const beats = parts.map(() => SHORT)
    return { rung, pattern: interleave(beats, GAP), beats, syllables: parts, stress, caption: CAPTION.count }
  }

  const beats = beatsOf(parts, stress)
  if (rung === 'rhythm') {
    return { rung, pattern: interleave(beats, GAP), beats, syllables: parts, stress, caption: CAPTION.rhythm }
  }

  return {
    rung,
    pattern: [ATTACK, ATTACK_GAP, ...interleave(beats, GAP)],
    beats,
    syllables: parts,
    stress,
    caption: CAPTION.onset
  }
}
