import { useEffect } from 'react'
import { AccessibilityInfo, Image, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg'

const BLOOM_MS = 700
const BLEED = 0.2
const HOLD_MS = 900
const FADE_MS = 480

const LAYERS = [
  { id: 'sky', color: '#7fa6f7', cx: 0.32, cy: 0.47, rx: 0.62, ry: 0.32, drift: 14, period: 5200 },
  { id: 'rose', color: '#d99cf4', cx: 0.7, cy: 0.42, rx: 0.6, ry: 0.32, drift: -12, period: 6100 },
  { id: 'core', color: '#6e50e8', cx: 0.54, cy: 0.49, rx: 0.46, ry: 0.25, drift: 6, period: 4600 },
  { id: 'haze', color: '#c3b4fb', cx: 0.5, cy: 0.7, rx: 0.55, ry: 0.13, drift: -6, period: 5600 }
] as const

function Layer({ layer, width, height }: { layer: (typeof LAYERS)[number]; width: number; height: number }) {
  const sway = useSharedValue(0)

  useEffect(() => {
    sway.value = withRepeat(withTiming(1, { duration: layer.period, easing: Easing.inOut(Easing.sin) }), -1, true)
    return () => cancelAnimation(sway)
  }, [sway, layer.period])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: (sway.value - 0.5) * layer.drift },
      { translateY: (0.5 - sway.value) * layer.drift * 0.6 },
      { scale: 1 + sway.value * 0.05 }
    ]
  }))

  const padX = width * BLEED
  const padY = height * BLEED

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: -padX, top: -padY, width: width + padX * 2, height: height + padY * 2 },
        style
      ]}
    >
      <Svg width={width + padX * 2} height={height + padY * 2}>
        <Defs>
          <RadialGradient id={`splash-${layer.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={layer.color} stopOpacity="1" />
            <Stop offset="0.55" stopColor={layer.color} stopOpacity="0.55" />
            <Stop offset="1" stopColor={layer.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={padX + width * layer.cx}
          cy={padY + height * layer.cy}
          rx={width * layer.rx}
          ry={height * layer.ry}
          fill={`url(#splash-${layer.id})`}
        />
      </Svg>
    </Animated.View>
  )
}

export function Splash({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions()
  const bloom = useSharedValue(0)
  const mark = useSharedValue(0)
  const veil = useSharedValue(1)

  useEffect(() => {
    let alive = true

    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!alive) return

      if (reduced) {
        bloom.value = 1
        mark.value = 1
        veil.value = withDelay(
          HOLD_MS,
          withTiming(0, { duration: 200 }, finished => {
            if (finished) runOnJS(onDone)()
          })
        )
        return
      }

      bloom.value = withTiming(1, { duration: BLOOM_MS, easing: Easing.bezier(0.22, 1, 0.36, 1) })
      mark.value = withDelay(
        BLOOM_MS * 0.45,
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
          withDelay(HOLD_MS, withTiming(1.06, { duration: FADE_MS, easing: Easing.in(Easing.cubic) }))
        )
      )
      veil.value = withDelay(
        BLOOM_MS * 0.45 + 520 + HOLD_MS,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.cubic) }, finished => {
          if (finished) runOnJS(onDone)()
        })
      )
    })

    return () => {
      alive = false
      cancelAnimation(bloom)
      cancelAnimation(mark)
      cancelAnimation(veil)
    }
  }, [bloom, mark, veil, onDone])

  const screen = useAnimatedStyle(() => ({ opacity: veil.value }))

  const field = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [{ scale: 0.7 + bloom.value * 0.3 }]
  }))

  const logo = useAnimatedStyle(() => ({
    opacity: Math.min(1, mark.value * 1.4),
    transform: [{ translateY: (1 - Math.min(1, mark.value)) * 10 }, { scale: 0.9 + Math.min(1, mark.value) * 0.1 }]
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
          backgroundColor: '#fbfaff'
        },
        screen
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, field]}>
        {LAYERS.map(layer => (
          <Layer key={layer.id} layer={layer} width={width} height={height} />
        ))}
      </Animated.View>

      <View className="flex-1 items-center justify-center">
        <Animated.View style={logo}>
          <Image
            source={require('../../assets/wordmark.png')}
            style={{ width: 150, height: 47, tintColor: '#ffffff' }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
    </Animated.View>
  )
}
