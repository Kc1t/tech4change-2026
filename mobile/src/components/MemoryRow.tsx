import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { color, font, kindColor, radius, shadow } from '../theme/tokens'
import type { Memory } from '../domain/memories'
import type { ProvenanceSource } from '../domain/types'

const BARS = 13

export const SOURCE_LABEL: Record<ProvenanceSource, string> = {
  audio: 'áudio',
  photo: 'foto',
  message: 'conversa',
  family: 'família'
}

const TINT: Record<ProvenanceSource, string> = {
  audio: color.brandSoft,
  photo: kindColor.animal,
  message: kindColor.place,
  family: kindColor.person
}

const ICON: Record<Exclude<ProvenanceSource, 'audio'>, string> = {
  photo: 'M4 8.5h2.2l1-1.6h5.6l1 1.6H16a1.6 1.6 0 0 1 1.6 1.6v5.3A1.6 1.6 0 0 1 16 17H4a1.6 1.6 0 0 1-1.6-1.6v-5.3A1.6 1.6 0 0 1 4 8.5Zm6 6.1a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z',
  message: 'M4.6 4.5h10.8a2 2 0 0 1 2 2v5.6a2 2 0 0 1-2 2H9l-3.6 2.8v-2.8h-.8a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z',
  family:
    'M7.2 9.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM14.4 9.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM2.6 16.4c0-2.2 2-3.6 4.6-3.6s4.6 1.4 4.6 3.6M12.6 12.9c2.4.1 4.2 1.5 4.2 3.5'
}

function amplitudes(seed: string): number[] {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Array.from({ length: BARS }, () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return 0.32 + ((hash >>> 0) % 1000) / 1450
  })
}

export function SourceMark({
  source,
  seed,
  size = 44
}: {
  source: ProvenanceSource
  seed: string
  size?: number
}) {
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: TINT[source] }
      ]}
    >
      {source === 'audio' ? <Wave seed={seed} /> : <Icon source={source} />}
    </View>
  )
}

function Wave({ seed }: { seed: string }) {
  const bars = amplitudes(seed)
  const id = `w-${seed.replace(/[^a-z0-9]/gi, '')}`

  return (
    <Svg viewBox="0 0 40 24" width={26} height={16}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0.4">
          <Stop offset="0" stopColor={color.aurora1} />
          <Stop offset="0.55" stopColor={color.aurora2} />
          <Stop offset="1" stopColor={color.aurora3} />
        </LinearGradient>
      </Defs>
      {bars.map((value, index) => {
        const height = value * 21
        return (
          <Rect
            key={index}
            x={index * 3.1 + 0.5}
            y={12 - height / 2}
            width={1.7}
            height={height}
            rx={0.85}
            fill={`url(#${id})`}
          />
        )
      })}
    </Svg>
  )
}

function Icon({ source }: { source: Exclude<ProvenanceSource, 'audio'> }) {
  return (
    <Svg viewBox="0 0 20 20" width={19} height={19}>
      <Path
        d={ICON[source]}
        fill="none"
        stroke={color.fg}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function MemoryRow({
  memory,
  tags,
  flat = false,
  onPress
}: {
  memory: Memory
  tags: string[]
  flat?: boolean
  onPress?: () => void
}) {
  const body = (
    <>
      <SourceMark source={memory.source} seed={memory.id} />
      <View style={styles.rowBody}>
        <Text style={styles.detail}>{memory.detail}</Text>
        <Text style={styles.meta}>
          {SOURCE_LABEL[memory.source].toUpperCase()} · {memory.ref.toUpperCase()}
        </Text>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map(tag => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </>
  )

  const shape = [styles.row, flat ? styles.rowFlat : styles.rowCard]

  if (!onPress) return <View style={shape}>{body}</View>

  return (
    <Pressable onPress={onPress} style={shape}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, minHeight: 0 },
  rowCard: { backgroundColor: color.surface, borderRadius: radius.card, ...shadow.card, shadowOpacity: 0.06 },
  rowFlat: { backgroundColor: 'transparent' },
  rowBody: { flex: 1, minWidth: 0 },
  detail: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 19, color: color.fg },
  meta: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label,
    marginTop: 6
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: color.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: font.regular,
    fontSize: 11,
    color: color.dim,
    overflow: 'hidden'
  }
})
