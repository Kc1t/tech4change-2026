'use client'

import { useEffect, useRef } from 'react'

const COUNT = 48
const VIEW_W = 480
const VIEW_H = 150
const BASE = Array.from({ length: COUNT }, (_, i) => {
  const wave = Math.sin(i * 0.52) * 0.34 + Math.sin(i * 1.31) * 0.2 + Math.sin(i * 0.17) * 0.16
  return 0.3 + Math.abs(wave)
})

export function SpeechWave({
  live,
  levelRef
}: {
  live: boolean
  levelRef: React.RefObject<number>
}) {
  const barsRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const group = barsRef.current
    if (!group) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rects = Array.from(group.children) as SVGRectElement[]
    let smoothed = 0
    let frame = 0

    function tick(now: number) {
      const target = levelRef.current ?? 0
      smoothed += (target - smoothed) * 0.24

      rects.forEach((rect, index) => {
        const shimmer = 1 + Math.sin(now / 320 + index * 0.7) * 0.12
        const ratio = BASE[index]! * (0.2 + smoothed * 0.8) * shimmer
        const height = Math.max(4, Math.min(ratio, 1) * VIEW_H * 0.82)
        rect.setAttribute('y', String(VIEW_H - height))
        rect.setAttribute('height', String(height))
      })

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [levelRef])

  const slot = VIEW_W / COUNT
  const barWidth = slot * 0.42

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={[
        'block h-[150px] w-full transition-opacity duration-700',
        live ? 'opacity-100' : 'opacity-45'
      ].join(' ')}
    >
      <defs>
        <linearGradient id="wave-skin" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2={VIEW_H}>
          <stop offset="0" stopColor="var(--aurora-4)" />
          <stop offset="0.28" stopColor="var(--aurora-1)" />
          <stop offset="0.62" stopColor="var(--aurora-2)" />
          <stop offset="1" stopColor="var(--aurora-3)" />
        </linearGradient>

        <linearGradient id="wave-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={VIEW_H}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>

        <mask id="wave-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
          <g ref={barsRef} fill="url(#wave-fade)">
            {BASE.map((_, index) => (
              <rect
                key={index}
                x={index * slot + (slot - barWidth) / 2}
                y={VIEW_H - 6}
                width={barWidth}
                height={6}
                rx={barWidth / 2}
              />
            ))}
          </g>
        </mask>
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill="url(#wave-skin)" mask="url(#wave-mask)" />
    </svg>
  )
}
