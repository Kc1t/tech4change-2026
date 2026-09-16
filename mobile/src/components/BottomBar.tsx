import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated'
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg'
import { color, radius, shadow } from '../theme/tokens'
import { BAR_INSET } from '../theme/insets'
import type { Route } from '../navigation'

const TAB_SIZE = 44
const ORB_SIZE = 52

const LEFT: Array<{ route: Route; label: string; path: string }> = [
  {
    route: 'graph',
    label: 'Grafo',
    path: 'M9 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM19.8 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM3 19c0-2.4 1.9-3.8 4.2-3.8S11.4 16.6 11.4 19M13 19c0-2.4 1.9-3.8 4.2-3.8S21.4 16.6 21.4 19'
  },
  {
    route: 'memories',
    label: 'Memórias',
    path: 'M7 4.6h10a1.6 1.6 0 0 1 1.6 1.6v13.2L12 16.4l-6.6 3V6.2A1.6 1.6 0 0 1 7 4.6Z'
  }
]

const RIGHT: Array<{ route: Route; label: string; path: string }> = [
  { route: 'progress', label: 'Progresso', path: 'M5 19V9M10 19V5M15 19v-7M20 19v-4' },
  {
    route: 'body',
    label: 'Aparelhos',
    path: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'
  }
]

const ORDER: Route[] = ['graph', 'memories', 'moment', 'progress', 'body']

export function BottomBar({
  route,
  onNavigate,
  onHome
}: {
  route: Route
  onNavigate: (next: Route) => void
  onHome: () => void
}) {
  const [width, setWidth] = useState(0)
  const slot = width > 0 ? width / ORDER.length : 0
  const index = ORDER.indexOf(route)
  const pill = useSharedValue(0)

  useEffect(() => {
    if (slot === 0 || index < 0 || route === 'moment') return
    const target = index * slot + (slot - TAB_SIZE) / 2
    pill.value = withTiming(target, { duration: 420, easing: Easing.out(Easing.cubic) })
  }, [index, slot, route, pill])

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pill.value }] }))

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {route !== 'moment' && slot > 0 && (
          <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
        )}

        {LEFT.map(tab => (
          <Tab key={tab.route} tab={tab} active={route === tab.route} onPress={onNavigate} />
        ))}

        <View style={styles.slot}>
          <Orb onPress={onHome} />
        </View>

        {RIGHT.map(tab => (
          <Tab key={tab.route} tab={tab} active={route === tab.route} onPress={onNavigate} />
        ))}
      </View>
    </View>
  )
}

function Tab({
  tab,
  active,
  onPress
}: {
  tab: { route: Route; label: string; path: string }
  active: boolean
  onPress: (next: Route) => void
}) {
  return (
    <View style={styles.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        onPress={() => onPress(tab.route)}
        style={styles.tab}
      >
        <Svg viewBox="0 0 24 24" width={21} height={21}>
          <Path
            d={tab.path}
            fill="none"
            stroke={active ? color.ink : color.dim}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  )
}

function Orb({ onPress }: { onPress: () => void }) {
  const spin = useSharedValue(0)

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [spin])

  const glow = useAnimatedStyle(() => ({
    transform: [
      { translateX: -6 + spin.value * 12 },
      { translateY: -5 + spin.value * 10 },
      { scale: 1 + spin.value * 0.12 }
    ]
  }))

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ir para o Momento"
      onPress={onPress}
      style={styles.orb}
    >
      <View style={styles.orbClip}>
        <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 52 52">
          <Defs>
            <RadialGradient id="orb-base" cx="50%" cy="50%" r="55%">
              <Stop offset="0" stopColor={color.aurora4} />
              <Stop offset="0.34" stopColor={color.aurora1} />
              <Stop offset="0.68" stopColor={color.aurora2} />
              <Stop offset="1" stopColor={color.aurora3} />
            </RadialGradient>
          </Defs>
          <Rect width={52} height={52} fill="url(#orb-base)" />
        </Svg>

        <Animated.View style={[styles.orbGlow, glow]} pointerEvents="none">
          <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 52 52">
            <Defs>
              <RadialGradient id="orb-hot" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={color.aurora4} stopOpacity="0.95" />
                <Stop offset="0.55" stopColor={color.aurora1} stopOpacity="0.45" />
                <Stop offset="1" stopColor={color.aurora1} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width={52} height={52} fill="url(#orb-hot)" />
          </Svg>
        </Animated.View>

        <View style={styles.orbShine} pointerEvents="none">
          <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 52 52">
            <Defs>
              <RadialGradient id="orb-shine" cx="34%" cy="26%" r="34%">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.68" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width={52} height={52} fill="url(#orb-shine)" />
          </Svg>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: BAR_INSET,
    zIndex: 30
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...shadow.bar
  },
  pill: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    backgroundColor: color.fg
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tab: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    shadowColor: color.brandRose,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6
  },
  orbClip: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden'
  },
  orbGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  orbShine: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
})
