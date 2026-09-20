import { useEffect } from 'react'
import { AccessibilityInfo, Image, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import { AuroraField } from './AuroraField'
import { color } from '../theme/tokens'

const RISE_MS = 520
const HOLD_MS = 620
const FADE_MS = 460

export function Splash({ onDone }: { onDone: () => void }) {
  const mark = useSharedValue(0)
  const veil = useSharedValue(1)

  useEffect(() => {
    let alive = true

    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!alive) return

      if (reduced) {
        veil.value = withDelay(
          HOLD_MS,
          withTiming(0, { duration: 200 }, finished => {
            if (finished) runOnJS(onDone)()
          })
        )
        mark.value = 1
        return
      }

      mark.value = withSequence(
        withTiming(1, { duration: RISE_MS, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
        withDelay(HOLD_MS, withTiming(1.04, { duration: FADE_MS, easing: Easing.in(Easing.cubic) }))
      )

      veil.value = withDelay(
        RISE_MS + HOLD_MS,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.cubic) }, finished => {
          if (finished) runOnJS(onDone)()
        })
      )
    })

    return () => {
      alive = false
      cancelAnimation(mark)
      cancelAnimation(veil)
    }
  }, [mark, veil, onDone])

  const screen = useAnimatedStyle(() => ({ opacity: veil.value }))

  const logo = useAnimatedStyle(() => ({
    opacity: Math.min(1, mark.value * 1.6),
    transform: [{ scale: 0.82 + Math.min(1, mark.value) * 0.18 }]
  }))

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          elevation: 60,
          backgroundColor: color.ink
        },
        screen
      ]}
    >
      <View className="absolute inset-x-0 bottom-0 h-[42%] opacity-80">
        <AuroraField state="delivering" level={0.45} />
      </View>

      <View className="flex-1 items-center justify-center">
        <Animated.View style={logo}>
          <Image
            source={require('../../assets/wordmark.png')}
            style={{ width: 168, height: 53 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
    </Animated.View>
  )
}
