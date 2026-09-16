'use client'

import { useEffect, useRef } from 'react'

const BARS = Array.from({ length: 42 }, (_, i) => {
  const wave = Math.sin(i * 0.52) * 0.34 + Math.sin(i * 1.31) * 0.2 + Math.sin(i * 0.17) * 0.16
  return 0.32 + Math.abs(wave)
})

export function SpeechWave({ live, levelRef }: { live: boolean; levelRef: React.RefObject<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let smoothed = 0
    let frame = 0

    function tick() {
      const target = levelRef.current ?? 0
      smoothed += (target - smoothed) * 0.24
      node!.style.setProperty('--level', smoothed.toFixed(3))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [levelRef])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ '--level': 0 } as React.CSSProperties}
      className={[
        'flex h-[86px] w-full items-center justify-center gap-[3px] px-5 transition-opacity duration-700',
        live ? 'opacity-100' : 'opacity-50'
      ].join(' ')}
    >
      {BARS.map((height, index) => (
        <span
          key={index}
          className="w-[3px] flex-1 rounded-full bg-[linear-gradient(to_bottom,var(--aurora-4),var(--aurora-1)_38%,var(--aurora-2)_78%,var(--aurora-3))] transition-[height,opacity] duration-150"
          style={{
            height: `calc(10px + ${height} * 34% + ${height} * var(--level) * 66%)`,
            opacity: 0.4 + height * 0.45
          }}
        />
      ))}
    </div>
  )
}
