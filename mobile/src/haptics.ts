import * as Haptics from 'expo-haptics'

export const PATTERNS = {
  confirm: [40],
  level1: [60],
  level2: [60, 80, 60],
  level3: [60, 80, 60, 80, 60],
  levelFinal: [220],
  success: [30, 40, 30, 40, 120]
} as const

export type PatternName = keyof typeof PATTERNS

export function patternFor(level: number, isFinal: boolean): PatternName {
  if (isFinal) return 'levelFinal'
  if (level >= 3) return 'level3'
  if (level === 2) return 'level2'
  return 'level1'
}

function styleFor(duration: number, intensity: number): Haptics.ImpactFeedbackStyle {
  const weight = duration >= 200 ? 3 : duration >= 100 ? 2 : 1
  const scaled = weight + (intensity >= 4 ? 1 : intensity <= 2 ? -1 : 0)
  if (scaled >= 3) return Haptics.ImpactFeedbackStyle.Heavy
  if (scaled <= 1) return Haptics.ImpactFeedbackStyle.Light
  return Haptics.ImpactFeedbackStyle.Medium
}

export function pulse(name: PatternName, intensity: number): () => void {
  const steps = PATTERNS[name]
  const timers: ReturnType<typeof setTimeout>[] = []
  let at = 0

  steps.forEach((duration, index) => {
    const isBuzz = index % 2 === 0
    if (isBuzz) {
      const delay = at
      timers.push(
        setTimeout(() => void Haptics.impactAsync(styleFor(duration, intensity)), delay)
      )
    }
    at += duration
  })

  return () => timers.forEach(clearTimeout)
}
