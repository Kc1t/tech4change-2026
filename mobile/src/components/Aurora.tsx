import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg'
import { color } from '../theme/tokens'

export type OrbState = 'off' | 'listening' | 'speaking' | 'blocked' | 'delivering'

const BLOBS = [
  { id: 'b1', fill: color.aurora1, cx: 25, cy: 40, rx: 35, ry: 30 },
  { id: 'b2', fill: color.aurora2, cx: 80, cy: 60, rx: 33, ry: 35 },
  { id: 'b3', fill: color.aurora3, cx: 50, cy: 103, rx: 40, ry: 28 },
  { id: 'b4', fill: color.aurora4, cx: 55, cy: 48, rx: 20, ry: 18 }
]

export function Aurora({ state, size }: { state: OrbState; size: number }) {
  const scale = useSharedValue(1)
  const agitated = state === 'speaking' || state === 'blocked' || state === 'delivering'

  useEffect(() => {
    cancelAnimation(scale)
    if (agitated) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.035, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.01, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.05, { duration: 250, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
      return
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2250, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2250, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
  }, [agitated, scale])

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[{ width: size, height: size }, animated]} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { opacity: state === 'off' ? 0.9 : 1 }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            {BLOBS.map(blob => (
              <RadialGradient key={blob.id} id={blob.id} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={blob.fill} stopOpacity="0.95" />
                <Stop offset="0.55" stopColor={blob.fill} stopOpacity="0.55" />
                <Stop offset="1" stopColor={blob.fill} stopOpacity="0" />
              </RadialGradient>
            ))}
          </Defs>

          <Circle cx="50" cy="50" r="50" fill={color.auroraBase} />
          {BLOBS.map(blob => (
            <Ellipse
              key={blob.id}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
              fill={`url(#${blob.id})`}
            />
          ))}
        </Svg>
      </View>
    </Animated.View>
  )
}
