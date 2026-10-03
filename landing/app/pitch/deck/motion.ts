import type { CSSProperties } from 'react'

export function motionDelay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties
}
