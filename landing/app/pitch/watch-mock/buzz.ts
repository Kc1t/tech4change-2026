const SWAY: Array<[string, string]> = [
  ['-4px 0', '-1.2deg'],
  ['4px 0', '1.2deg'],
  ['-3px 0', '-0.7deg'],
  ['3px 0', '0.7deg']
]
const STEP_MS = 30
const REST: Keyframe = { translate: '0 0', rotate: '0deg' }

export type Buzz = { keyframes: Keyframe[]; duration: number; pulses: number[] }

export function buzzOf(pattern: number[]): Buzz {
  const duration = pattern.reduce((sum, ms) => sum + ms, 0)
  if (duration === 0) return { keyframes: [], duration: 0, pulses: [] }
  const keyframes: Keyframe[] = [{ ...REST, offset: 0 }]
  const pulses: number[] = []
  let at = 0
  pattern.forEach((ms, n) => {
    if (n % 2 === 0) {
      pulses.push(at)
      const steps = Math.max(2, Math.round(ms / STEP_MS))
      for (let k = 1; k <= steps; k += 1) {
        const [translate, rotate] = SWAY[(k - 1) % SWAY.length]
        keyframes.push({ translate, rotate, offset: (at + (ms * k) / (steps + 1)) / duration })
      }
      keyframes.push({ ...REST, offset: (at + ms) / duration })
    }
    at += ms
  })
  if (keyframes[keyframes.length - 1].offset !== 1) keyframes.push({ ...REST, offset: 1 })
  return { keyframes, duration, pulses }
}
