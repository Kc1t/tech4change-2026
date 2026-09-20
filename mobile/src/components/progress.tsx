import { useState } from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { Card } from './ui'
import { color, font } from '../theme/tokens'

const H = 150
const PAD = { top: 26, bottom: 30 }

function curve(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M0,${points[0]!.y}L400,${points[0]!.y}`

  let d = `M${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!
    const next = points[i + 1]!
    const midX = (current.x + next.x) / 2
    d += `C${midX.toFixed(1)},${current.y.toFixed(1)} ${midX.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`
  }
  return d
}

export function TrendSky({ series, marks }: { series: number[]; marks: string[] }) {
  const [width, setWidth] = useState(0)

  const points = series.map((value, index) => ({
    x: -12 + (series.length === 1 ? 0.5 : index / (series.length - 1)) * (width + 24),
    y: PAD.top + (1 - Math.min(100, Math.max(0, value)) / 100) * (H - PAD.top - PAD.bottom)
  }))

  const path = curve(points)
  const halfway = series.findIndex(value => value >= 50)
  const marked = [...new Set([halfway, series.length - 1])]
    .map(index => points[index])
    .filter((point): point is { x: number; y: number } => Boolean(point) && point!.x > 28 && point!.x < width - 28)

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <View className="overflow-hidden" style={{ height: H }}>
        {width > 0 && (
          <Svg width={width} height={H}>
            <Defs>
              <LinearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={color.aurora1} />
                <Stop offset="0.35" stopColor={color.aurora4} />
                <Stop offset="0.55" stopColor={color.masteryHigh} />
                <Stop offset="0.75" stopColor={color.aurora1} />
                <Stop offset="1" stopColor={color.brandRose} />
              </LinearGradient>
              <LinearGradient id="dash" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color.masteryHigh} stopOpacity="0.55" />
                <Stop offset="1" stopColor={color.masteryHigh} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            <Path
              d={`M-20,115 Q 30,95 80,105 T 180,100 T 260,110 T 340,90 T ${width + 20},115 L${width + 20},${H} L-20,${H} Z`}
              fill="#dcd4f2"
              opacity={0.3}
            />

            {marked.map(point => (
              <Path
                key={`d-${point.x}`}
                d={`M${point.x},${point.y}L${point.x},${H - 10}`}
                stroke="url(#dash)"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            ))}

            {path ? (
              <Path
                d={path}
                fill="none"
                stroke="url(#line)"
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            ) : null}

            {marked.map(point => (
              <Circle
                key={`c-${point.x}`}
                cx={point.x}
                cy={point.y}
                r={6.5}
                fill={color.surface}
                stroke={color.aurora4}
                strokeWidth={2.5}
              />
            ))}
            {marked.map(point => (
              <Circle
                key={`i-${point.x}`}
                cx={point.x}
                cy={point.y}
                r={3.5}
                fill={color.masteryHigh}
              />
            ))}
          </Svg>
        )}
      </View>

      <View className="mt-1.5 flex-row justify-between px-6">
        {marks.map((mark, index) => (
          <Text
            key={`${mark}-${index}`}
            className="font-strong text-[11px] tracking-[0.8px] text-faint"
          >
            {mark.toUpperCase()}
          </Text>
        ))}
      </View>
    </View>
  )
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  tone = 'up'
}: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone?: 'up' | 'note' | 'down'
}) {
  const deltaColor =
    tone === 'up' ? color.deltaUp : tone === 'note' ? color.deltaNote : color.deltaDown

  return (
    <Card style={{ flex: 1 }}>
      <Text className="mb-1 font-mid text-body text-faint">{label}</Text>
      <View className="flex-row items-baseline">
        <Text className="font-heavy text-[24px] tracking-[-0.7px] text-fg">{value}</Text>
        {unit ? <Text className="ml-1 font-strong text-[18px] text-faint">{unit}</Text> : null}
      </View>
      <Text className="mt-2 font-strong text-note" style={{ color: deltaColor }}>
        {delta ?? ' '}
      </Text>
    </Card>
  )
}

const SEGMENTS = [
  { grow: 1, from: color.brandRose, to: color.aurora1 },
  { grow: 1.2, from: color.aurora1, to: color.aurora4 },
  { grow: 0.8, from: color.masteryHigh, to: color.aurora4 },
  { grow: 1.1, from: color.aurora1, to: color.brandRose }
]

export function Gauge({ value }: { value: number }) {
  const clamped = Math.min(97, Math.max(3, value))

  return (
    <View>
      <View className="h-2">
        <View className="absolute -ml-1" style={{ left: `${clamped}%` }}>
          <Svg viewBox="0 0 8 6" width={8} height={6}>
            <Path d="M4 6 0 0h8z" fill={color.faint} />
          </Svg>
        </View>
      </View>

      <View className="mt-1 h-6 flex-row gap-1.5">
        {SEGMENTS.map((segment, index) => (
          <View
            key={index}
            className="h-6 overflow-hidden rounded-full"
            style={{ flexGrow: segment.grow }}
          >
            <Svg width="100%" height={24}>
              <Defs>
                <LinearGradient id={`g-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={segment.from} />
                  <Stop offset="1" stopColor={segment.to} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={24} rx={12} fill={`url(#g-${index})`} opacity={0.9} />
            </Svg>
          </View>
        ))}
      </View>
    </View>
  )
}
