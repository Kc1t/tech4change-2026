'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NodeSheet } from '@/components/graph/NodeSheet'
import { SOURCE_LABEL, SourceMark } from '@/components/graph/SourceMark'
import { WordCloud, type CloudWord } from '@/components/graph/WordCloud'
import { BrandMark, ScreenHeader, TopBar } from '@/components/layout'
import { memoriesAbout, memoriesOf, memoryTags } from '@/domain/memories'
import { lifeGraph, useApp } from '@/store'
import type { NodeId } from '@/domain/types'

type Lens = 'life' | 'learning'

const FRESH_WINDOW_MS = 10 * 60 * 1000

export function GraphScreen() {
  const router = useRouter()
  const learning = useApp(s => s.learning)
  const setMemoryFilter = useApp(s => s.setMemoryFilter)
  const markLearningSeen = useApp(s => s.markLearningSeen)
  const [lens, setLens] = useState<Lens>('life')
  const [selected, setSelected] = useState<NodeId | null>(null)

  const memories = useMemo(() => memoriesOf(lifeGraph), [])

  const words = useMemo<CloudWord[]>(() => {
    return Object.values(lifeGraph.nodes).map(node => {
      const about = memoriesAbout(memories, node.id).length
      const isOwner = node.id === lifeGraph.owner
      return {
        id: node.id,
        label: node.label,
        kind: node.kind,
        weight: about,
        mastery: learning[node.id]?.mastery ?? 'unseen',
        isOwner
      }
    })
  }, [memories, learning])

  const fresh = useMemo(() => {
    const now = Date.now()
    let best: { id: NodeId; at: number } | null = null

    for (const [id, state] of Object.entries(learning)) {
      if (!state.lastSeen) continue
      const at = new Date(state.lastSeen).getTime()
      if (now - at > FRESH_WINDOW_MS) continue
      if (!best || at > best.at) best = { id, at }
    }

    return best?.id ?? null
  }, [learning])

  useEffect(() => {
    markLearningSeen()
  }, [markLearningSeen])

  const [announce, setAnnounce] = useState<NodeId | null>(null)

  useEffect(() => {
    if (lens !== 'learning' || !fresh) return
    setAnnounce(fresh)
    const timer = window.setTimeout(() => setAnnounce(null), 5200)
    return () => window.clearTimeout(timer)
  }, [lens, fresh])

  const anchorId = useMemo(() => {
    if (fresh && memoriesAbout(memories, fresh).length) return fresh
    const ranked = Object.values(lifeGraph.nodes)
      .filter(node => node.id !== lifeGraph.owner)
      .map(node => ({ id: node.id, about: memoriesAbout(memories, node.id) }))
      .filter(entry => entry.about.length > 0)
      .map(entry => ({
        id: entry.id,
        score: entry.about.length + (entry.about.some(m => m.source === 'audio') ? 10 : 0)
      }))
      .sort((a, b) => b.score - a.score)
    return ranked[0]?.id ?? null
  }, [fresh, memories])

  const anchorNode = anchorId ? lifeGraph.nodes[anchorId] : null
  const anchorMemories = anchorId ? memoriesAbout(memories, anchorId) : []
  const featured = anchorMemories.find(memory => memory.source === 'audio') ?? anchorMemories[0]

  const selectedNode = selected ? lifeGraph.nodes[selected] : null
  const announced = announce ? lifeGraph.nodes[announce] : null

  function openMemories(id: NodeId | null) {
    setMemoryFilter(id)
    setSelected(null)
    router.push('/memories')
  }

  return (
    <section className="relative flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-7 pt-[calc(10px+env(safe-area-inset-top,0px))]">
        <TopBar
          left={<BrandMark />}
          right={
            <div className="flex gap-0.5 rounded-full bg-surface-2 p-1">
              {(['life', 'learning'] as Lens[]).map(option => (
                <button
                  key={option}
                  onClick={() => setLens(option)}
                  className={[
                    'min-h-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                    option === lens ? 'bg-surface text-fg shadow-soft' : 'text-dim'
                  ].join(' ')}
                >
                  {option === 'life' ? 'Vida' : 'Aprendizado'}
                  {option === 'learning' && fresh && (
                    <i className="ml-1 inline-block size-1.5 rounded-full bg-brand align-middle" />
                  )}
                </button>
              ))}
            </div>
          }
        />

        <ScreenHeader
          label="a vida dela"
          title="Como tudo se conecta"
          sub="Cada memória revela um pouco mais da história."
        />
      </div>

      <div className="relative min-h-0 flex-1 px-4 pt-4">
        <WordCloud
          words={words}
          tinted={lens === 'learning'}
          caption={
            announced
              ? `${announced.label} acabou de entrar no que ela já alcança`
              : 'Toque numa palavra para ver de onde ela veio'
          }
          onPick={setSelected}
        />

      </div>

      <div className="shrink-0 px-7 pb-[96px] pt-3">
        {anchorNode && featured ? (
          <button
            onClick={() => setSelected(anchorNode.id)}
            className="flex w-full min-h-0 items-center gap-3 rounded-card bg-surface p-3 text-left shadow-soft"
          >
            <SourceMark source={featured.source} seed={featured.id} size={38} />
            <span className="min-w-0 flex-1">
              <span className="label-caps block truncate">
                {SOURCE_LABEL[featured.source]} · {anchorNode.label}
              </span>
              <span className="mt-1 block truncate text-[13px] font-medium text-fg">
                {featured.detail}
              </span>
            </span>
            {anchorMemories.length > 1 && (
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 text-[11px] font-semibold leading-none text-dim">
                +{anchorMemories.length - 1}
              </span>
            )}
          </button>
        ) : null}

        <button
          onClick={() => openMemories(null)}
          className="mt-2 w-full min-h-0 text-center text-[12.5px] font-semibold text-dim"
        >
          Ver todas as {memories.length} memórias
        </button>
      </div>

      {selectedNode && (
        <NodeSheet
          node={selectedNode}
          memories={memoriesAbout(memories, selectedNode.id)}
          tagsFor={memory =>
            memoryTags(lifeGraph, memory).filter(tag => tag !== selectedNode.label)
          }
          onClose={() => setSelected(null)}
          onSeeAll={() => openMemories(selectedNode.id)}
        />
      )}
    </section>
  )
}
