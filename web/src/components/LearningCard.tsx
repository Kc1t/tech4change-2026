'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { lifeGraph, useApp } from '@/store'

export function LearningCard() {
  const learning = useApp(s => s.learning)
  const ids = Object.keys(learning)
  const [fresh, setFresh] = useState<string | null>(null)
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(ids)
      return
    }
    const added = ids.find(id => !seen.current!.has(id))
    ids.forEach(id => seen.current!.add(id))
    if (!added) return
    setFresh(added)
    const timer = window.setTimeout(() => setFresh(null), 6000)
    return () => window.clearTimeout(timer)
  }, [ids])

  if (!fresh) return null

  const label = lifeGraph.nodes[fresh]?.label ?? 'Uma palavra'

  return (
    <Link
      href="/graph"
      className="animate-rise flex items-center gap-3 rounded-[18px] bg-surface p-3 shadow-[0_2px_8px_rgba(22,22,22,0.08),0_14px_32px_rgba(22,22,22,0.16)]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="var(--fg)"
          strokeWidth="1.5"
        >
          <circle cx="6" cy="8" r="2" fill="var(--fg)" stroke="none" />
          <circle cx="18" cy="7" r="2" fill="var(--fg)" stroke="none" />
          <circle cx="13" cy="18" r="2" fill="var(--fg)" stroke="none" />
          <circle cx="12" cy="11" r="2.4" fill="var(--fg)" stroke="none" />
          <path d="M7.6 9.2 10 10.4M16.4 8.2 13.8 9.8M12.4 13.4l.5 2.6" />
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block text-[15px] font-semibold leading-tight text-fg">
          Novo aprendizado
        </strong>
        <small className="mt-1 block truncate text-[13px] leading-tight text-dim">
          {label} entrou no mapa
        </small>
      </span>

      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-dim"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  )
}
