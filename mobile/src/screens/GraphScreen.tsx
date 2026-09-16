import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { NodeSheet } from '../components/NodeSheet'
import { MemoryRow, SOURCE_LABEL, SourceMark } from '../components/MemoryRow'
import { WordCloud, type CloudWord } from '../components/WordCloud'
import { BrandMark, ScreenHeader, TopBar } from '../components/ui'
import { memoriesAbout, memoriesOf, memoryTags } from '../domain/memories'
import { lifeGraph, useApp } from '../store'
import { color, font, radius, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'
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
    <View style={styles.screen}>
      <View style={styles.head}>
        <TopBar
          left={<BrandMark />}
          right={
            <View style={styles.lens}>
              {(['life', 'learning'] as Lens[]).map(option => (
                <Pressable
                  key={option}
                  onPress={() => setLens(option)}
                  style={[styles.lensTab, option === lens && styles.lensTabOn]}
                >
                  <Text style={[styles.lensText, option === lens && styles.lensTextOn]}>
                    {option === 'life' ? 'Vida' : 'Aprendizado'}
                  </Text>
                </Pressable>
              ))}
            </View>
          }
        />
        <ScreenHeader
          label="a vida dela"
          title="Como tudo se conecta"
          sub="Cada memória revela um pouco mais da história."
        />
      </View>

      <View style={styles.cloud}>
        <WordCloud
          words={words}
          tinted={lens === 'learning'}
          caption="Toque numa palavra para ver de onde ela veio"
          onPick={setSelected}
        />
      </View>

      <View style={styles.foot}>
        {anchorNode && featured ? (
          <Pressable onPress={() => setSelected(anchorNode.id)} style={styles.featured}>
            <SourceMark source={featured.source} seed={featured.id} size={38} />
            <View style={styles.featuredBody}>
              <Text style={styles.featuredLabel} numberOfLines={1}>
                {SOURCE_LABEL[featured.source].toUpperCase()} · {anchorNode.label.toUpperCase()}
              </Text>
              <Text style={styles.featuredText} numberOfLines={1}>
                {featured.detail}
              </Text>
            </View>
            {anchorMemories.length > 1 && (
              <Text style={styles.more}>+{anchorMemories.length - 1}</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable onPress={() => onOpenMemories(null)} style={styles.allButton}>
          <Text style={styles.allText}>Ver todas as {memories.length} memórias</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  head: { paddingHorizontal: 24, paddingTop: TOP_INSET },
  cloud: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  foot: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 128, gap: 8 },
  lens: { flexDirection: 'row', backgroundColor: color.surface2, borderRadius: radius.pill, padding: 3 },
  lensTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, minHeight: 0 },
  lensTabOn: { backgroundColor: color.surface },
  lensText: { fontFamily: font.semibold, fontSize: 11, color: color.dim },
  lensTextOn: { color: color.fg },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: 12,
    minHeight: 0,
    ...shadow.card,
    shadowOpacity: 0.07
  },
  featuredBody: { flex: 1, minWidth: 0 },
  featuredLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.4, color: color.label },
  featuredText: { fontFamily: font.medium, fontSize: 13, color: color.fg, marginTop: 4 },
  more: {
    backgroundColor: color.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: font.semibold,
    fontSize: 11,
    color: color.dim,
    overflow: 'hidden'
  },
  allButton: { minHeight: 0, paddingVertical: 8, alignItems: 'center' },
  allText: { fontFamily: font.semibold, fontSize: 12.5, color: color.dim }
})
