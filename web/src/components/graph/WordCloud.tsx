'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Mastery, NodeId, NodeKind } from '@/domain/types'

const KIND_ORDER: NodeKind[] = ['person', 'place', 'object', 'animal', 'event']

const MASTERY_FADE: Record<Mastery, number> = {
  high: 1,
  medium: 0.72,
  low: 0.48,
  unseen: 0.34
}

const MIN_SIZE = 15
const MAX_SIZE = 34
const OWNER_SIZE = 42
const EDGE = 16
const EDGE_TOP = 52
const EDGE_BOTTOM = 40

export interface CloudWord {
  id: NodeId
  label: string
  kind: NodeKind
  weight: number
  mastery: Mastery
  isOwner: boolean
}

interface Placed extends CloudWord {
  size: number
  left: number
  top: number
}

interface Region {
  kind: NodeKind
  x: number
  y: number
  spread: number
}

function measure(label: string, size: number) {
  return { w: label.length * size * 0.56 + 14, h: size * 1.4 }
}

function hits(a: Placed, b: Placed): boolean {
  const one = measure(a.label, a.size)
  const two = measure(b.label, b.size)
  return (
    Math.abs(a.left - b.left) < (one.w + two.w) / 2 + 10 &&
    Math.abs(a.top - b.top) < (one.h + two.h) / 2 + 8
  )
}

function regionsFor(kinds: NodeKind[]): Region[] {
  const present = KIND_ORDER.filter(kind => kinds.includes(kind))
  const step = (Math.PI * 2) / Math.max(1, present.length)

  return present.map((kind, index) => {
    const angle = -Math.PI / 2 + index * step + 0.35
    return {
      kind,
      x: 0.5 + Math.cos(angle) * 0.29,
      y: 0.5 + Math.sin(angle) * 0.3,
      spread: 0.17
    }
  })
}

function layout(words: CloudWord[], box: { w: number; h: number }, regions: Region[]): Placed[] {
  if (box.w === 0) return []

  const heaviest = Math.max(...words.map(word => word.weight), 1)
  const ordered = [...words].sort(
    (a, b) => Number(b.isOwner) - Number(a.isOwner) || b.weight - a.weight
  )
  const placed: Placed[] = []
  const seen = new Map<NodeKind, number>()

  for (const word of ordered) {
    const size = word.isOwner
      ? OWNER_SIZE
      : MIN_SIZE + (word.weight / heaviest) * (MAX_SIZE - MIN_SIZE)
    const span = measure(word.label, size)

    const clampX = (value: number) =>
      Math.min(Math.max(value, span.w / 2 + EDGE), box.w - span.w / 2 - EDGE)
    const clampY = (value: number) =>
      Math.min(Math.max(value, span.h / 2 + EDGE_TOP), box.h - span.h / 2 - EDGE_BOTTOM)

    const region = regions.find(entry => entry.kind === word.kind)
    const rank = seen.get(word.kind) ?? 0
    seen.set(word.kind, rank + 1)

    const orbit = rank === 0 ? 0 : (region?.spread ?? 0.12)
    const angle = rank * 2.3 + word.kind.length
    const wish = word.isOwner
      ? { left: clampX(box.w * 0.5), top: clampY(box.h * 0.5) }
      : {
          left: clampX(box.w * ((region?.x ?? 0.5) + Math.cos(angle) * orbit)),
          top: clampY(box.h * ((region?.y ?? 0.5) + Math.sin(angle) * orbit * 0.85))
        }

    let best: Placed = { ...word, size, ...wish }

    for (let step = 1; step < 110; step++) {
      if (!placed.some(other => hits(best, other))) break
      best = {
        ...word,
        size,
        left: clampX(wish.left + Math.cos(step * 2.4) * step * 2.6),
        top: clampY(wish.top + Math.sin(step * 2.4) * step * 2)
      }
    }

    placed.push(best)
  }

  return placed
}

export function WordCloud({
  words,
  tinted,
  caption,
  onPick
}: {
  words: CloudWord[]
  tinted: boolean
  caption: string
  onPick: (id: NodeId) => void
}) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry!.contentRect
      setBox({ w: rect.width, h: rect.height })
    })
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  const regions = useMemo(() => regionsFor(words.map(word => word.kind)), [words])
  const placed = useMemo(() => layout(words, box, regions), [words, box, regions])

  return (
    <div ref={fieldRef} className="relative h-full w-full overflow-hidden rounded-[30px] bg-ink">
      <span aria-hidden="true" className="absolute inset-0">
        {regions.map(region => (
          <i
            key={region.kind}
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              background: `radial-gradient(circle, var(--kind-${region.kind}), transparent 66%)`
            }}
            className="absolute block h-[76%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[54px]"
          />
        ))}
        <i className="absolute left-1/2 top-1/2 block h-[48%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--brand-soft),transparent_68%)] blur-[52px]" />
      </span>

      <span className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />

      {placed.map(word => (
        <button
          key={word.id}
          onClick={() => onPick(word.id)}
          style={{
            left: word.left,
            top: word.top,
            fontSize: word.size,
            color: word.isOwner ? 'var(--brand)' : `var(--kind-${word.kind}-ink)`,
            opacity: tinted ? MASTERY_FADE[word.mastery] : 1
          }}
          className="absolute min-h-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-1.5 font-semibold leading-none tracking-[-0.035em] transition-transform active:scale-95"
        >
          {word.label}
        </button>
      ))}

      <p className="pointer-events-none absolute inset-x-6 bottom-4 text-center text-[11.5px] italic leading-snug text-dim">
        {caption}
      </p>
    </div>
  )
}
