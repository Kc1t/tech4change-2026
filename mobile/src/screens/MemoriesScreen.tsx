import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { MemoryRow } from '../components/MemoryRow'
import { BackButton, Screen, ScreenHeader, TopBar } from '../components/ui'
import { memoriesAbout, memoriesOf, memoryTags } from '../domain/memories'
import { lifeGraph, useApp } from '../store'
import { color, font, radius } from '../theme/tokens'

export function MemoriesScreen({ onBack }: { onBack: () => void }) {
  const filter = useApp(s => s.memoryFilter)
  const setMemoryFilter = useApp(s => s.setMemoryFilter)

  const memories = useMemo(() => memoriesOf(lifeGraph), [])
  const focus = filter ? lifeGraph.nodes[filter] : null
  const listed = focus ? memoriesAbout(memories, focus.id) : memories

  return (
    <Screen gap={8}>
      <TopBar left={<BackButton onPress={onBack} />} />

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
        <Pressable onPress={() => setMemoryFilter(null)} style={styles.chip}>
          <Text style={styles.chipText}>{focus.label}</Text>
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

      <View style={styles.list}>
        {listed.map(memory => (
          <MemoryRow
            key={memory.id}
            memory={memory}
            tags={memoryTags(lifeGraph, memory).filter(tag => tag !== focus?.label)}
          />
        ))}
      </View>

      <Text style={styles.note}>
        Toda memória fica presa à ligação que ela sustenta. Se o modelo citar uma ligação que não
        existe no grafo, a resposta inteira é rejeitada — por isso o sistema não consegue inventar
        uma parente.
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.fg,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 0
  },
  chipText: { fontFamily: font.semibold, fontSize: 12, color: color.ink },
  list: { gap: 8, marginTop: 8 },
  note: {
    fontFamily: font.regular,
    fontSize: 11,
    lineHeight: 17,
    color: color.faint,
    marginTop: 12
  }
})
