import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { MemoryRow } from '../components/MemoryRow'
import { BackButton, BrandMark, Screen, ScreenHeader, TopBar } from '../components/ui'
import { memoriesAbout, memoriesOf, memoryTags } from '../domain/memories'
import { lifeGraph, useApp } from '../store'
import { color } from '../theme/tokens'

export function MemoriesScreen({ onBack }: { onBack: () => void }) {
  const filter = useApp(s => s.memoryFilter)
  const setMemoryFilter = useApp(s => s.setMemoryFilter)

  const memories = useMemo(() => memoriesOf(lifeGraph), [])
  const focus = filter ? lifeGraph.nodes[filter] : null
  const listed = focus ? memoriesAbout(memories, focus.id) : memories

  return (
    <Screen>
      <TopBar left={focus ? <BackButton onPress={onBack} /> : <BrandMark />} />

      <ScreenHeader
        title={focus ? focus.label : 'Memórias'}
        sub={
          focus
            ? `${listed.length} ${listed.length === 1 ? 'memória sustenta' : 'memórias sustentam'} essa ligação.`
            : 'Cada ligação nasceu de uma foto, um áudio ou uma conversa.'
        }
      />

      {focus && (
        <Pressable
          onPress={() => setMemoryFilter(null)}
          className="flex-row items-center gap-2 self-start rounded-full bg-fg px-3 py-2"
        >
          <Text className="font-strong text-note text-ink">{focus.label}</Text>
          <Svg viewBox="0 0 20 20" width={14} height={14}>
            <Path
              d="m5.5 5.5 9 9M14.5 5.5l-9 9"
              fill="none"
              stroke={color.ink}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      )}

      <View className="gap-2">
        {listed.map(memory => (
          <MemoryRow
            key={memory.id}
            memory={memory}
            tags={memoryTags(lifeGraph, memory).filter(tag => tag !== focus?.label)}
          />
        ))}
      </View>

      <Text className="font-book text-[11px] leading-[17px] text-faint">
        Toda memória fica presa à ligação que ela sustenta. Se o modelo citar uma ligação que não
        existe no grafo, a resposta inteira é rejeitada — por isso o sistema não consegue inventar
        uma parente.
      </Text>
    </Screen>
  )
}
