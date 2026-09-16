import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { MemoryRow } from './MemoryRow'
import { color, font, kindColor, radius } from '../theme/tokens'
import type { Memory } from '../domain/memories'
import type { GraphNode, NodeKind } from '../domain/types'

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
  const total = memories.length

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <View style={styles.head}>
          <View style={[styles.dot, { backgroundColor: kindColor[node.kind] }]} />
          <View style={styles.headText}>
            <Text style={styles.title} numberOfLines={1}>
              {node.label}
            </Text>
            <Text style={styles.kind}>
              {KIND_LABEL[node.kind]}
              {node.aliases?.length ? ` · também chamada de ${node.aliases.join(', ')}` : ''}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
            <Svg viewBox="0 0 20 20" width={16} height={16}>
              <Path
                d="m5.5 5.5 9 9M14.5 5.5l-9 9"
                fill="none"
                stroke={color.dim}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>
            {total === 1 ? 'APARECE EM 1 MEMÓRIA' : `APARECE EM ${total} MEMÓRIAS`}
          </Text>

          {memories.slice(0, PREVIEW).map(memory => (
            <MemoryRow key={memory.id} memory={memory} tags={tagsFor(memory)} flat />
          ))}
        </ScrollView>

        {total > PREVIEW && (
          <Pressable onPress={onSeeAll} style={styles.all}>
            <Text style={styles.allText}>Ver todas ({total})</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(18,16,15,0.55)' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 28,
    maxHeight: '76%'
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.line,
    alignSelf: 'center',
    marginTop: 12
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  headText: { flex: 1, minWidth: 0 },
  title: { fontFamily: font.semibold, fontSize: 19, letterSpacing: -0.6, color: color.fg },
  kind: { fontFamily: font.regular, fontSize: 12.5, color: color.faint, marginTop: 2 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0
  },
  list: { paddingHorizontal: 20 },
  count: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label,
    marginBottom: 4
  },
  all: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: color.surface2,
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 0
  },
  allText: { fontFamily: font.semibold, fontSize: 13, color: color.fg }
})
