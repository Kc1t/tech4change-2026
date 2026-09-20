import { useEffect } from 'react'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue
} from 'react-native-reanimated'
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  Line,
  RadialGradient,
  Stop
} from 'react-native-svg'
import { color } from '../theme/tokens'
import type { OrbState } from './AuroraField'

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse)

const R = 42
const MERIDIANS = [0, 1, 2, 3, 4]
const PARALLELS = [15, 28]
const SPIN_MS = 19000

const SPEED: Record<OrbState, number> = {
  off: 0.55,
  listening: 1,
  speaking: 1.5,
  blocked: 1.8,
  delivering: 2.3
}

function Meridian({ index, phase, opacity }: { index: number; phase: SharedValue<number>; opacity: number }) {
  const props = useAnimatedProps(() => ({
    rx: Math.max(Math.abs(Math.cos(phase.value + (index * Math.PI) / MERIDIANS.length)) * R, 0.35)
  }))

  return (
    <AnimatedEllipse
      cx={50}
      cy={50}
      ry={R}
      animatedProps={props}
      fill="none"
      stroke={color.surface}
      strokeOpacity={opacity}
      strokeWidth={0.7}
    />
  )
}

export function GlassOrb({ state, size }: { state: OrbState; size: number }) {
  const phase = useSharedValue(0)
  const scale = useSharedValue(1)
  const live = state !== 'off'
  const agitated = state === 'speaking' || state === 'blocked' || state === 'delivering'

  useEffect(() => {
    cancelAnimation(phase)
    phase.value = 0
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: SPIN_MS / SPEED[state], easing: Easing.linear }),
      -1,
      false
    )
  }, [state, phase])

  useEffect(() => {
    cancelAnimation(scale)
    scale.value = withRepeat(
      agitated
        ? withSequence(
            withTiming(1.04, { duration: 320, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 380, easing: Easing.inOut(Easing.ease) })
          )
        : withSequence(
            withTiming(1.025, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) })
          ),
      -1,
      false
    )
  }, [agitated, scale])

  const blobA = useAnimatedProps(() => ({
    cx: 50 + Math.cos(phase.value * 0.6) * 13,
    cy: 50 + Math.sin(phase.value * 0.78) * 11
  }))

  const blobB = useAnimatedProps(() => ({
    cx: 50 - Math.cos(phase.value * 0.45) * 12,
    cy: 50 - Math.sin(phase.value * 0.6) * 10
  }))

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[{ width: size, height: size }, animated]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="go-body" cx="34%" cy="28%" r="78%">
            <Stop offset="0" stopColor={color.surface} stopOpacity="0.98" />
            <Stop offset="0.42" stopColor={color.brandSoft} stopOpacity="0.72" />
            <Stop offset="0.78" stopColor={color.aurora4} stopOpacity="0.5" />
            <Stop offset="1" stopColor={color.aurora2} stopOpacity="0.42" />
          </RadialGradient>

          <RadialGradient id="go-halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0.62" stopColor={color.aurora2} stopOpacity="0" />
            <Stop offset="0.86" stopColor={color.aurora2} stopOpacity="0.32" />
            <Stop offset="1" stopColor={color.aurora2} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="go-blob-a" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color.aurora1} stopOpacity="0.55" />
            <Stop offset="1" stopColor={color.aurora1} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="go-blob-b" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color.aurora3} stopOpacity="0.6" />
            <Stop offset="1" stopColor={color.aurora3} stopOpacity="0" />
          </RadialGradient>

          <Filter id="go-soft" x="-40%" y="-40%" width="180%" height="180%">
            <FeGaussianBlur stdDeviation="2.4" />
          </Filter>

          <ClipPath id="go-clip">
            <Circle cx={50} cy={50} r={R} />
          </ClipPath>
        </Defs>

        <Circle cx={50} cy={50} r={49} fill="url(#go-halo)" filter="url(#go-soft)" />
        <Circle cx={50} cy={50} r={R} fill="url(#go-body)" />

        <G clipPath="url(#go-clip)">
          <AnimatedEllipse cy={50} rx={26} ry={22} fill="url(#go-blob-a)" animatedProps={blobA} />
          <AnimatedEllipse cy={50} rx={22} ry={26} fill="url(#go-blob-b)" animatedProps={blobB} />
        </G>

        <G transform="rotate(-16 50 50)">
          {MERIDIANS.map(index => (
            <Meridian key={index} index={index} phase={phase} opacity={live ? 0.92 : 0.74} />
          ))}
          {PARALLELS.map(ry => (
            <Ellipse
              key={`p${ry}`}
              cx={50}
              cy={50}
              rx={R}
              ry={ry}
              fill="none"
              stroke={color.surface}
              strokeOpacity={live ? 0.8 : 0.62}
              strokeWidth={0.7}
            />
          ))}
          <Line
            x1={50}
            y1={50 - R}
            x2={50}
            y2={50 + R}
            stroke={color.surface}
            strokeOpacity={live ? 0.8 : 0.62}
            strokeWidth={0.7}
          />
        </G>

        <Circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke={color.surface}
          strokeOpacity="0.95"
          strokeWidth={1.1}
        />
        <Ellipse
          cx={36}
          cy={30}
          rx={13}
          ry={9}
          fill={color.surface}
          opacity="0.55"
          transform="rotate(-28 36 30)"
          filter="url(#go-soft)"
        />
      </Svg>
    </Animated.View>
  )
}
