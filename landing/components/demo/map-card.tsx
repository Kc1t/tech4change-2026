'use client'

import { AudioLines, ChevronRight, Heart, MapPin, Users } from 'lucide-react'
import type { Rung } from './desk-listener'

const SPOTS = [
  { x: 28, y: 16, side: 'left', icon: Users },
  { x: 72, y: 16, side: 'right', icon: Heart },
  { x: 28, y: 84, side: 'left', icon: MapPin },
  { x: 72, y: 84, side: 'right', icon: AudioLines }
] as const

export function MapCard({
  rungs,
  level,
  answer,
  resolved
}: {
  rungs: Rung[]
  level: number
  answer: string
  resolved: boolean
}) {
  const spots = rungs.length === 1 ? [SPOTS[1]!] : SPOTS.slice(0, Math.max(rungs.length, 1))
  const current = rungs[level - 1]
  const center = resolved ? answer : current ? current.text : 'a palavra'

  return (
    <section className="v3-glass rounded-[1.5rem] px-7 py-6">
      <header className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#e9e2fa] text-[var(--v3-accent)]">
            <Users className="size-4" />
          </span>
          <span className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--v3-accent-deep)] uppercase">
            Seu mapa
          </span>
        </span>
        <span className="flex items-center gap-1 text-[0.84rem] text-[var(--v3-muted)]">
          Suas memórias se conectam
          <ChevronRight className="size-4" />
        </span>
      </header>

      <div className="relative mt-4 aspect-[7/6] w-full">
        <svg
          viewBox="0 0 300 260"
          className="absolute inset-0 size-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {spots.map((spot, i) => (
            <line
              key={i}
              x1="150"
              y1="130"
              x2={(spot.x / 100) * 300}
              y2={(spot.y / 100) * 260}
              stroke={i < level ? 'var(--v3-accent)' : '#ddd8ec'}
              strokeWidth={i < level ? 1.8 : 1.2}
              className="transition-all duration-500"
            />
          ))}
        </svg>

        {spots.map((spot, i) => {
          const rung = rungs[i]
          const lit = i < level
          return (
            <div
              key={i}
              className="absolute flex -translate-y-1/2 items-center gap-2.5"
              style={{
                top: `${spot.y}%`,
                ...(spot.side === 'left'
                  ? { right: `calc(${100 - spot.x}% - 1.5rem)`, flexDirection: 'row-reverse' }
                  : { left: `calc(${spot.x}% - 1.5rem)` })
              }}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
                  lit
                    ? 'bg-[linear-gradient(150deg,#a08fe0,#6b5fa8)] text-white'
                    : 'bg-[#eee9fa] text-[#b6b0c6]'
                }`}
              >
                <spot.icon className="size-5" />
              </span>

              <span
                className={`block w-[6.2rem] shrink-0 ${
                  spot.side === 'left' ? 'text-right' : 'text-left'
                }`}
              >
                <span className="block text-[0.82rem] leading-tight font-semibold text-[var(--v3-ink)]">
                  {rung ? label(rung) : '—'}
                </span>
                <span className="block text-[0.72rem] leading-tight text-[var(--v3-muted)]">
                  {rung ? rung.kind : ''}
                </span>
              </span>
            </div>
          )
        })}

        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span
            className={`grid size-[4.2rem] place-items-center rounded-full text-white shadow-[0_14px_34px_-18px_rgba(70,55,120,0.9)] transition-colors duration-500 ${
              resolved
                ? 'bg-[linear-gradient(150deg,#8f7fd4,#6b5fa8)]'
                : 'bg-[linear-gradient(150deg,#4f4769,#2f2b40)]'
            }`}
          >
            <Users className="size-7" />
          </span>
          <span className="mt-3 text-center text-[0.92rem] leading-tight font-semibold text-balance">
            {center}
          </span>
          <span className="mt-2 rounded-full bg-[#e9e2fa] px-3 py-1 text-[0.74rem] font-medium text-[var(--v3-accent-deep)]">
            {resolved
              ? `Alcançada em ${level}`
              : level === 0
                ? 'Escuta ligada'
                : `Degrau ${level} · atual`}
          </span>
        </div>
      </div>
    </section>
  )
}

function label(rung: Rung) {
  const text = rung.text
  const stripped = text.replace(/^(é d[ao]|da|mora em)\s+/i, '')
  const first = stripped.charAt(0).toUpperCase() + stripped.slice(1)
  return first
}
