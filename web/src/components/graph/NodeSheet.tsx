'use client'

import { useEffect } from 'react'
import { MemoryRow } from '@/components/graph/MemoryRow'
import type { Memory } from '@/domain/memories'
import type { GraphNode, NodeKind } from '@/domain/types'

const KIND_LABEL: Record<NodeKind, string> = {
  person: 'Pessoa',
  place: 'Lugar',
  object: 'Coisa',
  event: 'Momento',
  animal: 'Bicho'
}

const PREVIEW = 3

export function NodeSheet({
  node,
  memories,
  tagsFor,
  onClose,
  onSeeAll
}: {
  node: GraphNode
  memories: Memory[]
  tagsFor: (memory: Memory) => string[]
  onClose: () => void
  onSeeAll: () => void
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const total = memories.length

  return (
    <>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="animate-in fade-in absolute inset-0 z-40 min-h-0 cursor-default bg-[#221f2b]/55 duration-300"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={node.label}
        className="animate-rise absolute inset-x-0 bottom-0 z-50 flex max-h-[76%] flex-col rounded-t-[26px] bg-surface pb-[calc(86px+env(safe-area-inset-bottom,0px))] shadow-[0_-10px_40px_rgba(34,31,43,0.22)]"
      >
        <span aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />

        <div className="flex items-start gap-3 px-5 pb-3 pt-4">
          <span
            aria-hidden="true"
            className="mt-0.5 size-3 shrink-0 rounded-full"
            style={{ background: `var(--kind-${node.kind})` }}
          />
          <span className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold leading-tight tracking-[-0.03em] text-fg">
              {node.label}
            </h3>
            <p className="mt-0.5 text-xs text-faint">
              {KIND_LABEL[node.kind]}
              {node.aliases?.length ? ` · também chamada de ${node.aliases.join(', ')}` : ''}
            </p>
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 min-h-0 shrink-0 place-items-center rounded-full bg-surface-2 text-dim"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <p className="label-caps">
            {total === 1 ? 'aparece em 1 memória' : `aparece em ${total} memórias`}
          </p>

          <div className="mt-1 flex flex-col divide-y divide-line-soft">
            {memories.slice(0, PREVIEW).map(memory => (
              <MemoryRow key={memory.id} memory={memory} tags={tagsFor(memory)} flat />
            ))}
          </div>
        </div>

        {total > PREVIEW && (
          <div className="px-5 pt-3">
            <button
              onClick={onSeeAll}
              className="w-full rounded-card bg-surface-2 py-3 text-[13px] font-semibold text-fg"
            >
              Ver todas ({total})
            </button>
          </div>
        )}
      </div>
    </>
  )
}
