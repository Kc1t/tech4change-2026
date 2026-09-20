import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { color } from '../theme/tokens'

export type OrbState = 'off' | 'listening' | 'speaking' | 'blocked' | 'delivering'

const W = 400
const H = 320
const STEPS = 26

const LAYERS = [
  { id: 'af-back', base: 0.34, amp: 0.035, freq: 1.1, drift: 0.00021, opacity: 0.8 },
  { id: 'af-mid', base: 0.52, amp: 0.045, freq: 1.8, drift: -0.00034, opacity: 0.9 },
  { id: 'af-front', base: 0.74, amp: 0.035, freq: 2.7, drift: 0.00047, opacity: 0.95 }
]

const RAMPS: Record<string, string[]> = {
  'af-back': [color.aurora4, color.aurora1, color.aurora2],
  'af-mid': [color.aurora1, color.aurora2, color.aurora2],
  'af-front': [color.aurora1, color.aurora2, color.aurora3]
}

function shape(layer: (typeof LAYERS)[number], phase: number, boost: number): string {
  const amplitude = (layer.amp + boost) * H
  let d = ''

  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS
    const x = u * W
    const y =
      layer.base * H -
      (Math.sin(u * Math.PI * layer.freq * 2 + phase) * 0.6 +
        Math.sin(u * Math.PI * layer.freq * 5 + phase * 1.7) * 0.3 +
        Math.sin(u * Math.PI * layer.freq * 9 + phase * 2.4) * 0.12) *
        amplitude
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }

  return `${d}L${W},${H}L0,${H}Z`
}

export function AuroraField({ state, level = 0 }: { state: OrbState; level?: number }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 140)
    return () => clearInterval(timer)
  }, [])

  const now = tick * 140
  const boost = state === 'off' ? 0 : 0.04 + level * 0.14

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Defs>
          {LAYERS.map(layer => (
            <LinearGradient key={layer.id} id={layer.id} x1="0" y1="0" x2="1" y2="0.5">
              <Stop offset="0" stopColor={RAMPS[layer.id]![0]} />
              <Stop offset="0.55" stopColor={RAMPS[layer.id]![1]} />
              <Stop offset="1" stopColor={RAMPS[layer.id]![2]} />
            </LinearGradient>
          ))}
          <LinearGradient id="af-veil" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.ink} stopOpacity="1" />
            <Stop offset="0.26" stopColor={color.ink} stopOpacity="0.28" />
            <Stop offset="0.55" stopColor={color.ink} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {LAYERS.map(layer => (
          <Path
            key={layer.id}
            d={shape(layer, now * layer.drift, boost)}
            fill={`url(#${layer.id})`}
            opacity={layer.opacity}
          />
        ))}

        <Rect width={W} height={H} fill="url(#af-veil)" />
      </Svg>
    </View>
  )
}
