'use client'

import { SOURCE_LABEL, SourceMark } from '@/components/graph/SourceMark'
import type { Memory } from '@/domain/memories'

export function MemoryRow({
  memory,
  tags,
  flat = false,
  onOpen
}: {
  memory: Memory
  tags: string[]
  flat?: boolean
  onOpen?: () => void
}) {
  const body = (
    <>
      <SourceMark source={memory.source} seed={memory.id} />

      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium leading-snug text-fg">
          {memory.detail}
        </span>
        <span className="label-caps mt-1.5 block">
          {SOURCE_LABEL[memory.source]} · {memory.ref}
        </span>
        {tags.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-surface-2 px-2 py-[3px] text-[11px] leading-none text-dim"
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
    </>
  )

  const shape = [
    'flex w-full items-start gap-3 rounded-card p-3 text-left',
    flat ? 'bg-transparent' : 'bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)]'
  ].join(' ')

  if (!onOpen) return <div className={shape}>{body}</div>

  return (
    <button onClick={onOpen} className={`${shape} min-h-0 transition-colors hover:bg-surface-2/40`}>
      {body}
    </button>
  )
}
