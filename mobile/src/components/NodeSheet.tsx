import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { MemoryRow } from './MemoryRow'
import { color, kindColor } from '../theme/tokens'
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
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(34,31,43,0.55)' }}
        onPress={onClose}
      />

      <View className="max-h-[76%] rounded-t-[26px] bg-surface pb-7">
        <View className="mt-3 h-1 w-10 self-center rounded-sm bg-line" />

        <View className="flex-row items-start gap-3 px-5 pb-3 pt-4">
          <View
            className="mt-1 size-3 rounded-full"
            style={{ backgroundColor: kindColor[node.kind] }}
          />
          <View className="min-w-0 flex-1">
            <Text className="font-strong text-[19px] tracking-[-0.6px] text-fg" numberOfLines={1}>
              {node.label}
            </Text>
            <Text className="mt-0.5 font-book text-[12.5px] text-faint">
              {KIND_LABEL[node.kind]}
              {node.aliases?.length ? ` · também chamada de ${node.aliases.join(', ')}` : ''}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="size-9 items-center justify-center rounded-full bg-surface-2"
            hitSlop={8}
          >
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

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          <Text className="mb-1 font-strong text-[11px] tracking-[1.4px] text-label">
            {total === 1 ? 'APARECE EM 1 MEMÓRIA' : `APARECE EM ${total} MEMÓRIAS`}
          </Text>

          {memories.slice(0, PREVIEW).map(memory => (
            <MemoryRow key={memory.id} memory={memory} tags={tagsFor(memory)} flat />
          ))}
        </ScrollView>

        {total > PREVIEW && (
          <Pressable
            onPress={onSeeAll}
            className="mx-5 mt-3 items-center rounded-card bg-surface-2 py-3.5"
          >
            <Text className="font-strong text-hint text-fg">Ver todas ({total})</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  )
}
