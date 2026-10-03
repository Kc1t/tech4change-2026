import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg'
import { color } from '../theme/tokens'

export type BuddyMood = 'asleep' | 'listening' | 'speaking' | 'guess' | 'cue' | 'happy'

const SOFT_SPRING = { damping: 9, stiffness: 140, mass: 0.8 }
const CALM_SPRING = { damping: 14, stiffness: 120 }

function Sphere({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="buddy-core" cx="44%" cy="42%" r="60%">
          <Stop offset="0" stopColor="#8b7bee" />
          <Stop offset="0.45" stopColor="#9d8cf3" />
          <Stop offset="0.82" stopColor={color.aurora1} />
        </RadialGradient>
        <RadialGradient id="buddy-sky" cx="50%" cy="106%" r="46%">
          <Stop offset="0" stopColor={color.aurora3} stopOpacity="1" />
          <Stop offset="1" stopColor={color.aurora3} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="buddy-haze" cx="74%" cy="30%" r="40%">
          <Stop offset="0" stopColor={color.aurora2} stopOpacity="0.7" />
          <Stop offset="1" stopColor={color.aurora2} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="buddy-rim" cx="50%" cy="50%" r="50%">
          <Stop offset="0.58" stopColor="#ffe8f6" stopOpacity="0" />
          <Stop offset="0.98" stopColor="#ffe8f6" stopOpacity="0.95" />
        </RadialGradient>
        <RadialGradient id="buddy-shine" cx="33%" cy="27%" r="13%">
          <Stop offset="0.2" stopColor="#ffffff" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="50" fill="url(#buddy-core)" />
      <Circle cx="50" cy="50" r="50" fill="url(#buddy-sky)" />
      <Circle cx="50" cy="50" r="50" fill="url(#buddy-haze)" />
      <Circle cx="50" cy="50" r="50" fill="url(#buddy-rim)" />
      <Circle cx="50" cy="50" r="50" fill="url(#buddy-shine)" />
    </Svg>
  )
}

function HappyEye({ width }: { width: number }) {
  return (
    <Svg width={width} height={width * 0.6} viewBox="0 0 22 13">
      <Path d="M2.5 11.5 Q11 -3 19.5 11.5" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </Svg>
  )
}

export function Buddy({
  size,
  mood,
  level = 0,
  pulse = 0,
  pressed = false
}: {
  size: number
  mood: BuddyMood
  level?: number
  pulse?: number
  pressed?: boolean
}) {
  const breath = useSharedValue(0)
  const scaleX = useSharedValue(0.6)
  const scaleY = useSharedValue(0.6)
  const tilt = useSharedValue(0)
  const lift = useSharedValue(0)
  const blink = useSharedValue(1)
  const gazeX = useSharedValue(0)
  const gazeY = useSharedValue(0)
  const ring = useSharedValue(0)
  const previousMood = useRef<BuddyMood>(mood)
  const sway = useRef(1)

  const eyeWidth = size * 0.08
  const eyeHeight = size * 0.187
  const asleep = mood === 'asleep'
  const happy = mood === 'happy'

  useEffect(() => {
    scaleX.value = withSpring(1, SOFT_SPRING)
    scaleY.value = withSpring(1, SOFT_SPRING)
  }, [scaleX, scaleY])

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: asleep ? 3200 : 2100, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
  }, [asleep, breath])

  useEffect(() => {
    const was = previousMood.current
    previousMood.current = mood
    const base = mood === 'cue' ? 1.04 : 1

    if (was === 'asleep' && mood !== 'asleep') {
      scaleX.value = withSequence(withTiming(0.94, { duration: 160 }), withSpring(base, SOFT_SPRING))
      scaleY.value = withSequence(withTiming(1.07, { duration: 160 }), withSpring(base, SOFT_SPRING))
      lift.value = withSequence(withTiming(-size * 0.03, { duration: 180 }), withSpring(0, SOFT_SPRING))
    } else if (mood === 'happy' && was !== 'happy') {
      scaleX.value = withSequence(withTiming(1.06, { duration: 110 }), withSpring(1, SOFT_SPRING))
      scaleY.value = withSequence(withTiming(0.94, { duration: 110 }), withSpring(1, SOFT_SPRING))
      lift.value = withSequence(
        withTiming(0, { duration: 110 }),
        withTiming(-size * 0.07, { duration: 240, easing: Easing.out(Easing.quad) }),
        withSpring(0, SOFT_SPRING)
      )
    } else if (mood === 'cue' && was !== 'cue') {
      lift.value = withSequence(withTiming(size * 0.025, { duration: 180 }), withSpring(0, SOFT_SPRING))
      scaleX.value = withSpring(base, SOFT_SPRING)
      scaleY.value = withSpring(base, SOFT_SPRING)
    } else {
      scaleX.value = withSpring(base, CALM_SPRING)
      scaleY.value = withSpring(base, CALM_SPRING)
    }

    tilt.value = withSpring(mood === 'guess' ? -7 : 0, CALM_SPRING)
    gazeX.value = withSpring(mood === 'guess' ? -size * 0.03 : 0, CALM_SPRING)
    gazeY.value = withSpring(mood === 'speaking' ? -size * 0.06 : 0, CALM_SPRING)
  }, [mood, size, scaleX, scaleY, lift, tilt, gazeX, gazeY])

  useEffect(() => {
    if (pulse === 0) return
    sway.current = -sway.current
    tilt.value = withSequence(withTiming(sway.current * 2.2, { duration: 90 }), withSpring(mood === 'guess' ? -7 : 0, SOFT_SPRING))
    ring.value = 0
    ring.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) })
  }, [pulse, tilt, ring])

  useEffect(() => {
    if (!pressed) return
    scaleX.value = withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, SOFT_SPRING))
    scaleY.value = withSequence(withTiming(0.93, { duration: 90 }), withSpring(1, SOFT_SPRING))
  }, [pressed, scaleX, scaleY])

  useEffect(() => {
    if (asleep || happy) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        blink.value = withSequence(withTiming(0.12, { duration: 70 }), withTiming(1, { duration: 110 }))
        schedule()
      }, 2600 + Math.random() * 3200)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [asleep, happy, blink])

  const talk = mood === 'speaking' ? level : 0

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value + (asleep ? size * 0.03 : 0) },
      { rotate: `${tilt.value}deg` },
      { scaleX: scaleX.value * (1 + breath.value * 0.024 + talk * 0.04) },
      { scaleY: scaleY.value * (1 - breath.value * 0.017 - talk * 0.03) }
    ],
    opacity: asleep ? 0.82 : 1
  }))

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gazeX.value }, { translateY: gazeY.value }]
  }))

  const eyeStyle = useAnimatedStyle(() => ({
    height: asleep ? eyeHeight * 0.14 : eyeHeight * blink.value,
    transform: [{ translateY: asleep ? eyeHeight * 0.3 : 0 }]
  }))

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 || ring.value === 1 ? 0 : 0.5 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 0.8 }]
  }))

  return (
    <View style={{ width: size * 1.3, height: size * 1.25, alignItems: 'center', justifyContent: 'flex-start' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: size * 0.15,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color.aurora1
          },
          ringStyle
        ]}
      />
      <View style={{ position: 'absolute', top: size * 1.08, opacity: asleep ? 0.35 : 0.8 }}>
        <Svg width={size * 0.8} height={size * 0.2} viewBox="0 0 80 20">
          <Defs>
            <RadialGradient id="buddy-floor" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color.aurora1} stopOpacity="0.55" />
              <Stop offset="1" stopColor={color.aurora1} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx="40" cy="10" rx="40" ry="10" fill="url(#buddy-floor)" />
        </Svg>
      </View>
      <Animated.View style={[{ marginTop: size * 0.15, width: size, height: size }, bodyStyle]}>
        <Sphere size={size} />
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: size * 0.44 - eyeHeight / 2,
              height: eyeHeight,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: size * 0.173
            },
            faceStyle
          ]}
        >
          {happy ? (
            <>
              <HappyEye width={eyeWidth * 1.9} />
              <HappyEye width={eyeWidth * 1.9} />
            </>
          ) : (
            <>
              <Animated.View style={[{ width: eyeWidth, borderRadius: eyeWidth, backgroundColor: '#ffffff' }, eyeStyle]} />
              <Animated.View style={[{ width: eyeWidth, borderRadius: eyeWidth, backgroundColor: '#ffffff' }, eyeStyle]} />
            </>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  )
}
