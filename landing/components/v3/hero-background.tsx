'use client'

import { useState } from 'react'
import { Images } from 'lucide-react'

const BACKGROUNDS = [
  { id: 'retrato', src: '/hero-eilo.webp', label: 'Retrato', fit: 'object-cover object-right' },
  { id: 'ceu', src: '/sky.webp', label: 'Céu', fit: 'object-cover object-center' }
]

export function HeroBackground() {
  const [index, setIndex] = useState(0)
  const current = BACKGROUNDS[index]
  const next = BACKGROUNDS[(index + 1) % BACKGROUNDS.length]

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img src={current.src} alt="" className={`size-full ${current.fit}`} />
        <div className="v3-hero-veil absolute inset-0" />
      </div>

      <button
        type="button"
        onClick={() => setIndex(i => (i + 1) % BACKGROUNDS.length)}
        className="absolute top-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3.5 py-2 text-[0.75rem] font-medium text-[var(--v3-ink)] shadow-[0_8px_24px_-14px_rgba(43,35,51,0.5)] backdrop-blur-md transition-colors hover:bg-white/85"
      >
        <Images className="size-3.5 text-[var(--v3-accent)]" />
        Fundo: {current.label}
        <span className="text-[var(--v3-muted)]">→ {next.label}</span>
      </button>
    </>
  )
}
