'use client'

import { useId } from 'react'
import type { ProvenanceSource } from '@/domain/types'

const BARS = 13

export const SOURCE_LABEL: Record<ProvenanceSource, string> = {
  audio: 'áudio',
  photo: 'foto',
  message: 'conversa',
  family: 'família'
}

const TINT: Record<ProvenanceSource, string> = {
  audio: 'var(--brand-soft)',
  photo: 'var(--kind-animal)',
  message: 'var(--kind-place)',
  family: 'var(--kind-person)'
}

const ICON: Record<Exclude<ProvenanceSource, 'audio'>, string> = {
  photo: 'M4 8.5h2.2l1-1.6h5.6l1 1.6H16a1.6 1.6 0 0 1 1.6 1.6v5.3A1.6 1.6 0 0 1 16 17H4a1.6 1.6 0 0 1-1.6-1.6v-5.3A1.6 1.6 0 0 1 4 8.5Zm6 6.1a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z',
  message: 'M4.6 4.5h10.8a2 2 0 0 1 2 2v5.6a2 2 0 0 1-2 2H9l-3.6 2.8v-2.8h-.8a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z',
  family:
    'M7.2 9.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM14.4 9.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM2.6 16.4c0-2.2 2-3.6 4.6-3.6s4.6 1.4 4.6 3.6M12.6 12.9c2.4.1 4.2 1.5 4.2 3.5'
}

function amplitudes(seed: string): number[] {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Array.from({ length: BARS }, () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return 0.32 + ((hash >>> 0) % 1000) / 1450
  })
}

export function SourceMark({
  source,
  seed,
  size = 44
}: {
  source: ProvenanceSource
  seed: string
  size?: number
}) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: TINT[source] }}
    >
      {source === 'audio' ? <Wave seed={seed} /> : <Icon source={source} />}
    </span>
  )
}

function Wave({ seed }: { seed: string }) {
  const gradient = useId()
  const bars = amplitudes(seed)

  return (
    <svg viewBox="0 0 40 24" className="h-4 w-[26px]" role="presentation">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="var(--aurora-1)" />
          <stop offset="0.55" stopColor="var(--aurora-2)" />
          <stop offset="1" stopColor="var(--aurora-3)" />
        </linearGradient>
      </defs>
      {bars.map((value, index) => {
        const height = value * 21
        return (
          <rect
            key={index}
            x={index * 3.1 + 0.5}
            y={12 - height / 2}
            width="1.7"
            height={height}
            rx="0.85"
            fill={`url(#${gradient})`}
          />
        )
      })}
    </svg>
  )
}

function Icon({ source }: { source: Exclude<ProvenanceSource, 'audio'> }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[19px] w-[19px]"
      role="presentation"
      fill="none"
      stroke="var(--fg)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON[source]} />
    </svg>
  )
}
