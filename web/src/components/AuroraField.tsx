'use client'

import { useEffect, useRef } from 'react'
import type { OrbState } from '@/components/Orb'

const W = 400
const H = 320
const STEPS = 56

const LAYERS = [
  { id: 'af-back', base: 0.34, amp: 0.035, boost: 0.09, freq: 1.1, drift: 0.00021, opacity: 0.8 },
  { id: 'af-mid', base: 0.52, amp: 0.045, boost: 0.15, freq: 1.8, drift: -0.00034, opacity: 0.9 },
  { id: 'af-front', base: 0.74, amp: 0.035, boost: 0.2, freq: 2.7, drift: 0.00047, opacity: 0.95 }
]

export function AuroraField({
  state,
  levelRef
}: {
  state: OrbState
  levelRef: React.RefObject<number>
}) {
  const pathsRef = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let smoothed = 0
    let frame = 0

    function shape(now: number) {
      const target = levelRef.current ?? 0
      smoothed += (target - smoothed) * 0.16

      LAYERS.forEach((layer, index) => {
        const path = pathsRef.current[index]
        if (!path) return

        const amplitude = (layer.amp + smoothed * layer.boost) * H
        const phase = calm ? 0 : now * layer.drift
        let d = ''

        for (let i = 0; i <= STEPS; i++) {
          const x = (i / STEPS) * W
          const u = i / STEPS
          const y =
            layer.base * H -
            (Math.sin(u * Math.PI * layer.freq * 2 + phase) * 0.6 +
              Math.sin(u * Math.PI * layer.freq * 5 + phase * 1.7) * 0.3 +
              Math.sin(u * Math.PI * layer.freq * 9 + phase * 2.4) * 0.12) *
              amplitude
          d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
        }

        path.setAttribute('d', `${d}L${W},${H}L0,${H}Z`)
      })

      frame = requestAnimationFrame(shape)
    }

    frame = requestAnimationFrame(shape)
    return () => cancelAnimationFrame(frame)
  }, [levelRef])

  const live = state !== 'off'

  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={[
          'block h-full w-full transition-[filter,opacity] duration-700',
          live ? 'opacity-100 saturate-110' : 'opacity-95 saturate-95'
        ].join(' ')}
      >
        <defs>
          <linearGradient id="af-grad-back" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="var(--aurora-4)" />
            <stop offset="0.55" stopColor="var(--aurora-1)" />
            <stop offset="1" stopColor="var(--aurora-2)" />
          </linearGradient>
          <linearGradient id="af-grad-mid" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0" stopColor="var(--aurora-1)" />
            <stop offset="0.62" stopColor="var(--aurora-2)" />
            <stop offset="1" stopColor="var(--aurora-2)" />
          </linearGradient>
          <linearGradient id="af-grad-front" x1="0" y1="0" x2="1" y2="0.7">
            <stop offset="0" stopColor="var(--aurora-1)" />
            <stop offset="0.5" stopColor="var(--aurora-2)" />
            <stop offset="1" stopColor="var(--aurora-3)" />
          </linearGradient>

          <linearGradient id="af-veil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.22" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>

          <mask id="af-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="url(#af-veil)" />
          </mask>

          <filter id="af-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g mask="url(#af-mask)" filter="url(#af-soft)">
          {LAYERS.map((layer, index) => (
            <path
              key={layer.id}
              ref={node => {
                pathsRef.current[index] = node
              }}
              fill={`url(#af-grad-${layer.id.replace('af-', '')})`}
              opacity={layer.opacity}
            />
          ))}
        </g>
      </svg>

      <span className="grain pointer-events-none absolute inset-0 opacity-[0.14]" />
    </div>
  )
}
