import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { NodeSheet } from '../components/NodeSheet'
import { MemoryRow, SOURCE_LABEL, SourceMark } from '../components/MemoryRow'
import { WordCloud, type CloudWord } from '../components/WordCloud'
import { BrandMark, ScreenHeader, ScreenTop, TopBar } from '../components/ui'
import { memoriesAbout, memoriesOf, memoryTags } from '../domain/memories'
import { lifeGraph, useApp } from '../store'
import { shadow } from '../theme/tokens'
import type { NodeId } from '../domain/types'

type Lens = 'life' | 'learning'

export function GraphScreen({ onOpenMemories }: { onOpenMemories: (id: NodeId | null) => void }) {
  const learning = useApp(s => s.learning)
  const markLearningSeen = useApp(s => s.markLearningSeen)
  const [lens, setLens] = useState<Lens>('life')
  const [selected, setSelected] = useState<NodeId | null>(null)

  const memories = useMemo(() => memoriesOf(lifeGraph), [])

  useEffect(() => {
    markLearningSeen()
  }, [markLearningSeen])

  const words = useMemo<CloudWord[]>(
    () =>
      Object.values(lifeGraph.nodes).map(node => ({
        id: node.id,
        label: node.label,
        kind: node.kind,
        weight: memoriesAbout(memories, node.id).length,
        mastery: learning[node.id]?.mastery ?? 'unseen',
        isOwner: node.id === lifeGraph.owner
      })),
    [memories, learning]
  )

  const anchorId = useMemo(() => {
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
  }, [memories])

  const anchorNode = anchorId ? lifeGraph.nodes[anchorId] : null
  const anchorMemories = anchorId ? memoriesAbout(memories, anchorId) : []
  const featured = anchorMemories.find(memory => memory.source === 'audio') ?? anchorMemories[0]
  const selectedNode = selected ? lifeGraph.nodes[selected] : null

  return (
    <View className="flex-1 bg-ink">
      <ScreenTop>
        <TopBar
          left={<BrandMark />}
          right={
            <View className="flex-row rounded-full bg-surface-2 p-[3px]">
              {(['life', 'learning'] as Lens[]).map(option => (
                <Pressable
                  key={option}
                  onPress={() => setLens(option)}
                  className={`rounded-full px-3 py-1.5 ${option === lens ? 'bg-surface' : ''}`}
                >
                  <Text
                    className={`font-strong text-[11px] ${
                      option === lens ? 'text-fg' : 'text-dim'
                    }`}
                  >
                    {option === 'life' ? 'Vida' : 'Aprendizado'}
                  </Text>
                </Pressable>
              ))}
            </View>
          }
        />
        <ScreenHeader title="Mapa" sub="Toque numa palavra para ver de onde ela veio." />
      </ScreenTop>

      <View className="flex-1 px-4 pt-4">
        <WordCloud
          words={words}
          tinted={lens === 'learning'}
          caption="Toque numa palavra para ver de onde ela veio"
          onPick={setSelected}
        />
      </View>

      <View className="gap-2 px-6 pb-32 pt-3">
        {anchorNode && featured ? (
          <Pressable
            onPress={() => setSelected(anchorNode.id)}
            className="flex-row items-center gap-3 rounded-card bg-surface p-3"
            style={{ ...shadow.card, shadowOpacity: 0.07 }}
          >
            <SourceMark source={featured.source} seed={featured.id} size={38} />
            <View className="min-w-0 flex-1">
              <Text
                className="font-strong text-[11px] tracking-[1.4px] text-label"
                numberOfLines={1}
              >
                {SOURCE_LABEL[featured.source].toUpperCase()} · {anchorNode.label.toUpperCase()}
              </Text>
              <Text className="mt-1 font-mid text-hint text-fg" numberOfLines={1}>
                {featured.detail}
              </Text>
            </View>
            {anchorMemories.length > 1 && (
              <Text className="overflow-hidden rounded-full bg-surface-2 px-2 py-1 font-strong text-[11px] text-dim">
                +{anchorMemories.length - 1}
              </Text>
            )}
          </Pressable>
        ) : null}

        <Pressable onPress={() => onOpenMemories(null)} className="items-center py-2">
          <Text className="font-strong text-[12.5px] text-dim">
            Ver todas as {memories.length} memórias
          </Text>
        </Pressable>
      </View>

      {selectedNode && (
        <NodeSheet
          node={selectedNode}
          memories={memoriesAbout(memories, selectedNode.id)}
          tagsFor={memory =>
            memoryTags(lifeGraph, memory).filter(tag => tag !== selectedNode.label)
          }
          onClose={() => setSelected(null)}
          onSeeAll={() => {
            setSelected(null)
            onOpenMemories(selectedNode.id)
          }}
        />
      )}
    </View>
  )
}
