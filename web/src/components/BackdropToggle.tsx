'use client'

import { useApp } from '@/store'
import type { Backdrop } from '@/domain/types'

const WAVE_PATH = 'M3 12h2.2M8 7.5v9M12 4.5v15M16 8.5v7M20.8 12H19'
const ORB_PATH = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'
const ORB_MERIDIAN = 'M12 3c-3 2.6-3 13.4 0 18M12 3c3 2.6 3 13.4 0 18M3.2 12h17.6'

const OPTIONS: ReadonlyArray<{ value: Backdrop; label: string; path: string }> = [
  { value: 'wave', label: 'Fundo em onda', path: WAVE_PATH },
  { value: 'orb', label: 'Fundo em orbe', path: `${ORB_PATH} ${ORB_MERIDIAN}` }
]

export function BackdropToggle() {
  const backdrop = useApp(s => s.backdrop)
  const setBackdrop = useApp(s => s.setBackdrop)

  return (
    <div
      role="radiogroup"
      aria-label="Fundo da tela"
      className="relative flex rounded-full bg-surface-2"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 size-11 rounded-full bg-surface shadow-soft transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
          backdrop === 'orb' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {OPTIONS.map(option => {
        const on = option.value === backdrop
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={on}
            aria-label={option.label}
            onClick={() => setBackdrop(option.value)}
            className={`relative z-10 grid size-11 place-items-center rounded-full transition-colors duration-300 ${
              on ? 'text-brand' : 'text-faint'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-[19px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={option.path} />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
