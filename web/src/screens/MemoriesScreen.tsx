'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MemoryRow } from '@/components/graph/MemoryRow'
import { ScreenHeader } from '@/components/layout'
import { memoriesAbout, memoriesOf, memoryTags } from '@/domain/memories'
import { lifeGraph, useApp } from '@/store'

export function MemoriesScreen() {
  const router = useRouter()
  const filter = useApp(s => s.memoryFilter)
  const setMemoryFilter = useApp(s => s.setMemoryFilter)

  const memories = useMemo(() => memoriesOf(lifeGraph), [])
  const focus = filter ? lifeGraph.nodes[filter] : null
  const listed = focus ? memoriesAbout(memories, focus.id) : memories

  return (
    <section className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-7 pt-[calc(16px+env(safe-area-inset-top,0px))]">
        <button
          onClick={() => router.back()}
          className="-ml-2 flex min-h-0 items-center gap-1 py-2 pl-2 pr-3 text-[13px] font-semibold text-dim"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4.5 6.5 10l5.5 5.5" />
          </svg>
          Voltar
        </button>

        <ScreenHeader
          label="as memórias"
          title={focus ? focus.label : 'Tudo o que sustenta o mapa'}
          sub={
            focus
              ? `${listed.length} ${listed.length === 1 ? 'memória sustenta' : 'memórias sustentam'} essa ligação.`
              : 'Cada ligação nasceu de uma foto, um áudio ou uma conversa.'
          }
        />

        {focus && (
          <button
            onClick={() => setMemoryFilter(null)}
            className="mt-3 flex min-h-0 items-center gap-2 rounded-full bg-fg px-3 py-2 text-[12px] font-semibold text-ink"
          >
            {focus.label}
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
            </svg>
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-[96px] pt-4">
        <div className="flex flex-col gap-2">
          {listed.map(memory => (
            <MemoryRow
              key={memory.id}
              memory={memory}
              tags={memoryTags(lifeGraph, memory).filter(tag => tag !== focus?.label)}
            />
          ))}
        </div>

        <p className="mt-5 text-[0.68rem] leading-relaxed text-faint">
          Toda memória fica presa à ligação que ela sustenta. Se o modelo citar uma ligação que não
          existe no grafo, a resposta inteira é rejeitada — por isso o sistema não consegue inventar
          uma parente.
        </p>
      </div>
    </section>
  )
}
