'use client'

import { useEffect, useRef } from 'react'

const BLOBS = [
  {
    className: '-left-[10%] top-[10%] h-[60%] w-[70%]',
    color: 'var(--v3-orb-1)',
    duration: '14s'
  },
  {
    className: '-right-[15%] top-[25%] h-[70%] w-[65%]',
    color: 'var(--v3-orb-2)',
    duration: '17s'
  },
  {
    className: '-bottom-[20%] left-[10%] h-[55%] w-[80%]',
    color: 'var(--v3-orb-3)',
    duration: '20s'
  },
  {
    className: 'left-[35%] top-[30%] h-[35%] w-[40%]',
    color: 'var(--v3-orb-4)',
    duration: '12s'
  }
]

export function Orb({
  className = '',
  rings = true,
  interactive = false
}: {
  className?: string
  rings?: boolean
  interactive?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!interactive || !node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let level = 0
    let targetLevel = 0
    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0
    let frame = 0

    function onMove(event: PointerEvent) {
      const rect = node!.getBoundingClientRect()
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
      targetX = Math.max(-1, Math.min(1, dx))
      targetY = Math.max(-1, Math.min(1, dy))
      targetLevel = Math.max(0, 1 - Math.hypot(dx, dy))
    }

    function tick() {
      level += (targetLevel - level) * 0.07
      x += (targetX - x) * 0.05
      y += (targetY - y) * 0.05
      node!.style.setProperty('--level', level.toFixed(3))
      node!.style.setProperty('--px', x.toFixed(3))
      node!.style.setProperty('--py', y.toFixed(3))
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [interactive])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={
        interactive
          ? ({
              '--level': 0,
              '--px': 0,
              '--py': 0,
              transform:
                'translate3d(calc(var(--px) * 14px), calc(var(--py) * 14px), 0) scale(calc(1 + var(--level) * 0.09))'
            } as React.CSSProperties)
          : undefined
      }
      className={`relative grid aspect-square place-items-center will-change-transform ${className}`}
    >
      {rings ? (
        <>
          <span className="v3-orb-ring absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,rgba(185,163,247,0.5)_55%,transparent_70%)] opacity-0" />
          <span className="v3-orb-ring absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,rgba(239,182,236,0.45)_55%,transparent_70%)] opacity-0 [animation-delay:1.2s]" />
        </>
      ) : null}

      <div className="v3-orb-field v3-orb-talk relative aspect-square w-full overflow-hidden rounded-full saturate-[1.12]">
        {BLOBS.map(blob => (
          <span
            key={blob.className}
            style={{ background: blob.color, animationDuration: blob.duration }}
            className={`v3-orb-blob absolute ${blob.className}`}
          />
        ))}
        <span className="grain pointer-events-none absolute inset-0 opacity-[0.16]" />
      </div>
    </div>
  )
}
