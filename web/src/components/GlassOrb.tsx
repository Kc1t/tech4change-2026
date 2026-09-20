'use client'

import { useEffect, useRef } from 'react'
import type { OrbState } from '@/components/Orb'

const R = 42
const MERIDIANS = 5
const PARALLELS = [15, 28]
const SPIN_MS = 19000

const SPEED: Record<OrbState, number> = {
  off: 0.55,
  listening: 1,
  speaking: 1.5,
  blocked: 1.8,
  delivering: 2.3
}

export function GlassOrb({ state, size = 196 }: { state: OrbState; size?: number }) {
  const meridianRefs = useRef<(SVGEllipseElement | null)[]>([])
  const blobRefs = useRef<(SVGEllipseElement | null)[]>([])
  const speedRef = useRef(SPEED[state])

  speedRef.current = SPEED[state]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let phase = 0
    let last = 0
    let frame = 0

    function tick(now: number) {
      const delta = last ? Math.min(now - last, 64) : 16
      last = now
      phase += (delta / SPIN_MS) * Math.PI * 2 * speedRef.current

      for (let i = 0; i < MERIDIANS; i++) {
        const rx = Math.abs(Math.cos(phase + (i * Math.PI) / MERIDIANS)) * R
        meridianRefs.current[i]?.setAttribute('rx', Math.max(rx, 0.35).toFixed(2))
      }

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return
        const drift = phase * (index === 0 ? 0.6 : -0.45)
        blob.setAttribute('cx', (50 + Math.cos(drift) * 13).toFixed(2))
        blob.setAttribute('cy', (50 + Math.sin(drift * 1.3) * 11).toFixed(2))
      })

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const live = state !== 'off'
  const agitated = state === 'blocked' || state === 'delivering' || state === 'speaking'

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative block shrink-0 ${agitated ? '[animation:talk_1.3s_ease-in-out_infinite]' : 'animate-breathe'}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="go-body" cx="34%" cy="28%" r="78%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="0.42" stopColor="var(--brand-soft)" stopOpacity="0.72" />
            <stop offset="0.78" stopColor="var(--aurora-4)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--aurora-2)" stopOpacity="0.42" />
          </radialGradient>

          <radialGradient id="go-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0.62" stopColor="var(--aurora-2)" stopOpacity="0" />
            <stop offset="0.86" stopColor="var(--aurora-2)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--aurora-2)" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="go-blob-a" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--aurora-1)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--aurora-1)" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="go-blob-b" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--aurora-3)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--aurora-3)" stopOpacity="0" />
          </radialGradient>

          <filter id="go-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>

          <clipPath id="go-clip">
            <circle cx="50" cy="50" r={R} />
          </clipPath>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="49"
          fill="url(#go-halo)"
          filter="url(#go-soft)"
          className="animate-breathe [transform-origin:50%_50%]"
        />
        <circle cx="50" cy="50" r={R} fill="url(#go-body)" />

        <g clipPath="url(#go-clip)">
          <ellipse
            ref={node => {
              blobRefs.current[0] = node
            }}
            cx="50"
            cy="50"
            rx="26"
            ry="22"
            fill="url(#go-blob-a)"
          />
          <ellipse
            ref={node => {
              blobRefs.current[1] = node
            }}
            cx="50"
            cy="50"
            rx="22"
            ry="26"
            fill="url(#go-blob-b)"
          />
        </g>

        <g
          className="[animation:sway_11s_ease-in-out_infinite] [transform-origin:50%_50%]"
          fill="none"
          strokeLinecap="round"
        >
          {Array.from({ length: MERIDIANS }, (_, index) => (
            <ellipse
              key={index}
              ref={node => {
                meridianRefs.current[index] = node
              }}
              cx="50"
              cy="50"
              rx={Math.abs(Math.cos((index * Math.PI) / MERIDIANS)) * R}
              ry={R}
              stroke="#ffffff"
              strokeOpacity={live ? 0.92 : 0.74}
              strokeWidth="0.7"
            />
          ))}
          {PARALLELS.map(ry => (
            <ellipse
              key={`p${ry}`}
              cx="50"
              cy="50"
              rx={R}
              ry={ry}
              stroke="#ffffff"
              strokeOpacity={live ? 0.8 : 0.62}
              strokeWidth="0.7"
            />
          ))}
          <line
            x1="50"
            y1={50 - R}
            x2="50"
            y2={50 + R}
            stroke="#ffffff"
            strokeOpacity={live ? 0.8 : 0.62}
            strokeWidth="0.7"
          />
        </g>

        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.95"
          strokeWidth="1.1"
        />
        <ellipse
          cx="36"
          cy="30"
          rx="13"
          ry="9"
          fill="#ffffff"
          opacity="0.55"
          transform="rotate(-28 36 30)"
          filter="url(#go-soft)"
        />
      </svg>
    </span>
  )
}
