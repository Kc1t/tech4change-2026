'use client'

import { useEffect, useRef } from 'react'

export type AuroraState = 'listening' | 'searching' | 'delivering'

const W = 400
const H = 320
const STEPS = 56

const LAYERS = [
  { id: 'back', base: 0.34, amp: 0.035, boost: 0.09, freq: 1.1, drift: 0.00021, opacity: 0.8 },
  { id: 'mid', base: 0.52, amp: 0.045, boost: 0.15, freq: 1.8, drift: -0.00034, opacity: 0.9 },
  { id: 'front', base: 0.74, amp: 0.035, boost: 0.2, freq: 2.7, drift: 0.00047, opacity: 0.95 }
]

const GAIN: Record<AuroraState, number> = { listening: 1, searching: 0.42, delivering: 1.35 }

function speech(now: number) {
  const slow = Math.sin(now * 0.00052) * 0.5 + 0.5
  const words = Math.sin(now * 0.0031) * 0.5 + 0.5
  const grain = Math.sin(now * 0.0117) * 0.5 + 0.5
  const breath = Math.max(0, Math.sin(now * 0.00019))
  return (0.18 + slow * 0.34 + words * 0.3 + grain * 0.12) * (0.45 + breath * 0.55)
}

export function AuroraField({ state, className }: { state: AuroraState; className?: string }) {
  const paths = useRef<(SVGPathElement | null)[]>([])
  const gain = useRef(GAIN[state])

  useEffect(() => {
    gain.current = GAIN[state]
  }, [state])

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let smoothed = 0.2
    let frame = 0

    function draw(now: number) {
      const target = calm ? 0.12 : speech(now) * gain.current
      smoothed += (target - smoothed) * 0.07

      LAYERS.forEach((layer, index) => {
        const path = paths.current[index]
        if (!path) return

        const amplitude = (layer.amp + smoothed * layer.boost) * H
        const phase = calm ? 0 : now * layer.drift
        let d = ''

        for (let i = 0; i <= STEPS; i++) {
          const u = i / STEPS
          const y =
            layer.base * H -
            (Math.sin(u * Math.PI * layer.freq * 2 + phase) * 0.6 +
              Math.sin(u * Math.PI * layer.freq * 5 + phase * 1.7) * 0.3 +
              Math.sin(u * Math.PI * layer.freq * 9 + phase * 2.4) * 0.12) *
              amplitude
          d += `${i === 0 ? 'M' : 'L'}${(u * W).toFixed(1)},${y.toFixed(1)}`
        }

        path.setAttribute('d', `${d}L${W},${H}L0,${H}Z`)
      })

      if (!calm) frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div aria-hidden="true" className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={`block size-full transition-[opacity,filter] duration-700 ${
          state === 'searching' ? 'opacity-70 saturate-75' : 'opacity-100 saturate-105'
        }`}
      >
        <defs>
          <linearGradient id="v3-af-back" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="var(--v3-orb-4)" />
            <stop offset="0.55" stopColor="var(--v3-orb-1)" />
            <stop offset="1" stopColor="var(--v3-orb-2)" />
          </linearGradient>
          <linearGradient id="v3-af-mid" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0" stopColor="var(--v3-orb-1)" />
            <stop offset="0.62" stopColor="var(--v3-orb-2)" />
            <stop offset="1" stopColor="var(--v3-orb-2)" />
          </linearGradient>
          <linearGradient id="v3-af-front" x1="0" y1="0" x2="1" y2="0.7">
            <stop offset="0" stopColor="var(--v3-orb-1)" />
            <stop offset="0.5" stopColor="var(--v3-orb-2)" />
            <stop offset="1" stopColor="var(--v3-orb-3)" />
          </linearGradient>

          <linearGradient id="v3-af-veil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.68" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.86" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
          </linearGradient>

          <mask id="v3-af-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="url(#v3-af-veil)" />
          </mask>

          <filter id="v3-af-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g mask="url(#v3-af-mask)" filter="url(#v3-af-soft)">
          {LAYERS.map((layer, index) => (
            <path
              key={layer.id}
              ref={node => {
                paths.current[index] = node
              }}
              fill={`url(#v3-af-${layer.id})`}
              opacity={layer.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
