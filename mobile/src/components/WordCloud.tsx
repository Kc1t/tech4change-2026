import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, Ellipse, FeGaussianBlur, Filter, G, RadialGradient, Rect, Stop } from 'react-native-svg'
import { color, font, kindColor, kindInk, radius } from '../theme/tokens'
import type { Mastery, NodeId, NodeKind } from '../domain/types'

const KIND_ORDER: NodeKind[] = ['person', 'place', 'object', 'animal', 'event']

const MASTERY_FADE: Record<Mastery, number> = {
  high: 1,
  medium: 0.72,
  low: 0.48,
  unseen: 0.34
}

const MIN_SIZE = 15
const MAX_SIZE = 32
const OWNER_SIZE = 38
const EDGE = 16
const EDGE_TOP = 26
const EDGE_BOTTOM = 40

export interface CloudWord {
  id: NodeId
  label: string
  kind: NodeKind
  weight: number
  mastery: Mastery
  isOwner: boolean
}

interface Placed extends CloudWord {
  size: number
  left: number
  top: number
}

interface Region {
  kind: NodeKind
  x: number
  y: number
}

function measure(label: string, size: number) {
  return { w: label.length * size * 0.58 + 14, h: size * 1.4 }
}

function hits(a: Placed, b: Placed): boolean {
  const one = measure(a.label, a.size)
  const two = measure(b.label, b.size)
  return (
    Math.abs(a.left - b.left) < (one.w + two.w) / 2 + 10 &&
    Math.abs(a.top - b.top) < (one.h + two.h) / 2 + 8
  )
}

function regionsFor(kinds: NodeKind[]): Region[] {
  const present = KIND_ORDER.filter(kind => kinds.includes(kind))
  const step = (Math.PI * 2) / Math.max(1, present.length)

  return present.map((kind, index) => {
    const angle = -Math.PI / 2 + index * step + 0.35
    return {
      kind,
      x: 0.5 + Math.cos(angle) * 0.29,
      y: 0.5 + Math.sin(angle) * 0.3
    }
  })
}

function layout(words: CloudWord[], box: { w: number; h: number }, regions: Region[]): Placed[] {
  if (box.w === 0) return []

  const heaviest = Math.max(...words.map(word => word.weight), 1)
  const ordered = [...words].sort(
    (a, b) => Number(b.isOwner) - Number(a.isOwner) || b.weight - a.weight
  )
  const placed: Placed[] = []
  const seen = new Map<NodeKind, number>()

  for (const word of ordered) {
    const size = word.isOwner
      ? OWNER_SIZE
      : MIN_SIZE + (word.weight / heaviest) * (MAX_SIZE - MIN_SIZE)
    const span = measure(word.label, size)

    const clampX = (value: number) =>
      Math.min(Math.max(value, span.w / 2 + EDGE), box.w - span.w / 2 - EDGE)
    const clampY = (value: number) =>
      Math.min(Math.max(value, span.h / 2 + EDGE_TOP), box.h - span.h / 2 - EDGE_BOTTOM)

    const region = regions.find(entry => entry.kind === word.kind)
    const rank = seen.get(word.kind) ?? 0
    seen.set(word.kind, rank + 1)

    const orbit = rank === 0 ? 0 : 0.17
    const angle = rank * 2.3 + word.kind.length
    const wish = word.isOwner
      ? { left: clampX(box.w * 0.5), top: clampY(box.h * 0.5) }
      : {
          left: clampX(box.w * ((region?.x ?? 0.5) + Math.cos(angle) * orbit)),
          top: clampY(box.h * ((region?.y ?? 0.5) + Math.sin(angle) * orbit * 0.85))
        }

    let best: Placed = { ...word, size, ...wish }

    for (let step = 1; step < 110; step++) {
      if (!placed.some(other => hits(best, other))) break
      best = {
        ...word,
        size,
        left: clampX(wish.left + Math.cos(step * 2.4) * step * 2.6),
        top: clampY(wish.top + Math.sin(step * 2.4) * step * 2)
      }
    }

    placed.push(best)
  }

  return placed
}

export function WordCloud({
  words,
  tinted,
  caption,
  onPick
}: {
  words: CloudWord[]
  tinted: boolean
  caption: string
  onPick: (id: NodeId) => void
}) {
  const [box, setBox] = useState({ w: 0, h: 0 })
  const regions = useMemo(() => regionsFor(words.map(word => word.kind)), [words])
  const placed = useMemo(() => layout(words, box, regions), [words, box, regions])

  return (
    <View
      style={styles.field}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout
        setBox({ w: width, h: height })
      }}
    >
      {box.w > 0 && (
        <Svg width={box.w} height={box.h} style={StyleSheet.absoluteFill}>
          <Defs>
            {regions.map(region => (
              <RadialGradient key={region.kind} id={`r-${region.kind}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={kindColor[region.kind]} stopOpacity="0.95" />
                <Stop offset="0.5" stopColor={kindColor[region.kind]} stopOpacity="0.5" />
                <Stop offset="1" stopColor={kindColor[region.kind]} stopOpacity="0" />
              </RadialGradient>
            ))}
            <RadialGradient id="r-core" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color.brandSoft} stopOpacity="0.9" />
              <Stop offset="1" stopColor={color.brandSoft} stopOpacity="0" />
            </RadialGradient>
            <Filter id="soften" x="-25%" y="-25%" width="150%" height="150%">
              <FeGaussianBlur stdDeviation="26" />
            </Filter>
          </Defs>

          <Rect width={box.w} height={box.h} fill={color.ink} />

          <G filter="url(#soften)">
            {regions.map(region => (
              <Ellipse
                key={region.kind}
                cx={region.x * box.w}
                cy={region.y * box.h}
                rx={box.w * 0.52}
                ry={box.h * 0.42}
                fill={`url(#r-${region.kind})`}
              />
            ))}

            <Ellipse
              cx={box.w * 0.5}
              cy={box.h * 0.5}
              rx={box.w * 0.34}
              ry={box.h * 0.26}
              fill="url(#r-core)"
            />
          </G>
        </Svg>
      )}

      {placed.map(word => (
        <Pressable
          key={word.id}
          onPress={() => onPick(word.id)}
          hitSlop={8}
          style={[
            styles.word,
            {
              left: word.left - measure(word.label, word.size).w / 2,
              top: word.top - word.size * 0.7,
              width: measure(word.label, word.size).w
            }
          ]}
        >
          <Text
            style={{
              fontFamily: font.semibold,
              fontSize: word.size,
              lineHeight: word.size * 1.2,
              letterSpacing: -word.size * 0.035,
              textAlign: 'center',
              color: word.isOwner ? color.brand : kindInk[word.kind],
              opacity: tinted ? MASTERY_FADE[word.mastery] : 1
            }}
          >
            {word.label}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.caption}>{caption}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    borderRadius: radius.cloud,
    overflow: 'hidden',
    backgroundColor: color.ink
  },
  word: { position: 'absolute', alignItems: 'center', minHeight: 0 },
  caption: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 14,
    textAlign: 'center',
    fontFamily: font.regular,
    fontStyle: 'italic',
    fontSize: 11.5,
    lineHeight: 16,
    color: color.dim
  }
})
