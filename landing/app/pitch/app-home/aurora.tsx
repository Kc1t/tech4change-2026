'use client'

import { useEffect, useId, useState } from 'react'

export type OrbState = 'off' | 'listening' | 'speaking' | 'blocked' | 'delivering'

const W = 400
const H = 320
const STEPS = 26
const INK = '#f6f5fb'

const LAYERS = [
  { id: 'back', base: 0.34, amp: 0.035, freq: 1.1, drift: 0.00021, opacity: 0.8, ramp: ['#ffe0f2', '#b9a3f7', '#efb6ec'] },
  { id: 'mid', base: 0.52, amp: 0.045, freq: 1.8, drift: -0.00034, opacity: 0.9, ramp: ['#b9a3f7', '#efb6ec', '#efb6ec'] },
  { id: 'front', base: 0.74, amp: 0.035, freq: 2.7, drift: 0.00047, opacity: 0.95, ramp: ['#b9a3f7', '#efb6ec', '#a9dcff'] }
]

function shape(layer: (typeof LAYERS)[number], phase: number, boost: number): string {
  const amplitude = (layer.amp + boost) * H
  let d = ''

  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS
    const x = u * W
    const y =
      layer.base * H -
      (Math.sin(u * Math.PI * layer.freq * 2 + phase) * 0.6 +
        Math.sin(u * Math.PI * layer.freq * 5 + phase * 1.7) * 0.3 +
        Math.sin(u * Math.PI * layer.freq * 9 + phase * 2.4) * 0.12) *
        amplitude
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }

  return `${d}L${W},${H}L0,${H}Z`
}

export function AuroraField({ state, level = 0 }: { state: OrbState; level?: number }) {
  const id = `af${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setTick(value => value + 1), 140)
    return () => window.clearInterval(timer)
  }, [])

  const now = tick * 140
  const boost = state === 'off' ? 0 : 0.04 + level * 0.14

  return (
    <svg className="ah-aurora" width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        {LAYERS.map(layer => (
          <linearGradient key={layer.id} id={`${id}-${layer.id}`} x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0" stopColor={layer.ramp[0]} />
            <stop offset="0.55" stopColor={layer.ramp[1]} />
            <stop offset="1" stopColor={layer.ramp[2]} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}-veil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK} stopOpacity="1" />
          <stop offset="0.26" stopColor={INK} stopOpacity="0.28" />
          <stop offset="0.55" stopColor={INK} stopOpacity="0" />
        </linearGradient>
      </defs>
      {LAYERS.map(layer => (
        <path key={layer.id} d={shape(layer, now * layer.drift, boost)} fill={`url(#${id}-${layer.id})`} opacity={layer.opacity} />
      ))}
      <rect width={W} height={H} fill={`url(#${id}-veil)`} />
    </svg>
  )
}
