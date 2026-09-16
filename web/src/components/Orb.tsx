'use client'

import { useEffect, useRef } from 'react'

export type OrbState = 'off' | 'listening' | 'speaking' | 'blocked' | 'delivering'

interface OrbProps {
  state: OrbState
  levelRef: React.RefObject<number>
}

const BLOBS = [
  'absolute -left-[10%] top-[10%] h-[60%] w-[70%] bg-aurora-1 [animation-duration:14s]',
  'absolute -right-[15%] top-[25%] h-[70%] w-[65%] bg-aurora-2 [animation-duration:17s]',
  'absolute -bottom-[20%] left-[10%] h-[55%] w-[80%] bg-aurora-3 [animation-duration:20s]',
  'absolute left-[35%] top-[30%] h-[35%] w-[40%] bg-aurora-4 [animation-duration:12s]'
]

export function Orb({ state, levelRef }: OrbProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let smoothed = 0
    let frame = 0

    function tick() {
      const target = levelRef.current ?? 0
      smoothed += (target - smoothed) * 0.18
      node!.style.setProperty('--level', smoothed.toFixed(3))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [levelRef])

  const live = state !== 'off'
  const pulsing = state === 'blocked' || state === 'delivering'
  const agitated = pulsing || state === 'speaking'

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ '--level': 0, transform: 'scale(calc(1 + var(--level) * 0.14))' } as React.CSSProperties}
      className="relative grid h-full w-full place-items-center will-change-transform"
    >
      {pulsing && (
        <>
          <span className="absolute inset-[-4%] rounded-full opacity-0 [animation:ripple_1.8s_ease-out_infinite] [background:radial-gradient(circle,color-mix(in_srgb,var(--aurora-1)_45%,transparent)_55%,transparent_70%)]" />
          <span className="absolute inset-[-4%] rounded-full opacity-0 [animation:ripple_1.8s_ease-out_0.9s_infinite] [background:radial-gradient(circle,color-mix(in_srgb,var(--aurora-2)_40%,transparent)_55%,transparent_70%)]" />
        </>
      )}

      <div
        className={[
          'relative aspect-square w-full overflow-hidden rounded-full bg-aurora-base',
          'transition-[opacity,filter] duration-700',
          live ? 'opacity-100 saturate-[1.15]' : 'opacity-90 saturate-[0.8]',
          agitated ? '[animation:talk_1.1s_ease-in-out_infinite]' : 'animate-breathe'
        ].join(' ')}
      >
        {BLOBS.map(blob => (
          <span
            key={blob}
            className={`${blob} rounded-full opacity-90 blur-[30px] [animation-iteration-count:infinite] [animation-name:drift] [animation-timing-function:ease-in-out] [animation-direction:alternate]`}
          />
        ))}
        <span className="grain pointer-events-none absolute inset-0 opacity-[0.18]" />
      </div>
    </div>
  )
}
