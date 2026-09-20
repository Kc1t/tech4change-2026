import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { useApp } from '../store'
import { color, shadow } from '../theme/tokens'

const WAVE_PATH = 'M3 12h2.2M8 7.5v9M12 4.5v15M16 8.5v7M20.8 12H19'
const ORB_PATH =
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 3c-3 2.6-3 13.4 0 18M12 3c3 2.6 3 13.4 0 18M3.2 12h17.6'

const Icon = Animated.createAnimatedComponent(Svg)

export function BackdropToggle() {
  const backdrop = useApp(s => s.backdrop)
  const setBackdrop = useApp(s => s.setBackdrop)
  const orb = backdrop === 'orb'
  const swap = useSharedValue(orb ? 1 : 0)

  useEffect(() => {
    swap.value = withTiming(orb ? 1 : 0, {
      duration: 320,
      easing: Easing.bezier(0.22, 1, 0.36, 1)
    })
  }, [orb, swap])

  const waveStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    opacity: 1 - swap.value,
    transform: [{ scale: 1 - swap.value * 0.3 }, { rotate: `${swap.value * -90}deg` }]
  }))

  const orbStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    opacity: swap.value,
    transform: [{ scale: 0.7 + swap.value * 0.3 }, { rotate: `${(1 - swap.value) * 90}deg` }]
  }))

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: orb }}
      accessibilityLabel={
        orb ? 'Fundo em orbe. Tocar para trocar para onda' : 'Fundo em onda. Tocar para trocar para orbe'
      }
      onPress={() => setBackdrop(orb ? 'wave' : 'orb')}
      hitSlop={6}
      className="min-h-tap flex-row items-center gap-1.5 self-center rounded-full bg-surface px-2.5 py-1.5"
      style={{ ...shadow.card, shadowOpacity: 0.05, minHeight: 34 }}
    >
      <View className="size-[21px] items-center justify-center">
        <Icon viewBox="0 0 24 24" width={19} height={19} style={waveStyle}>
          <Path
            d={WAVE_PATH}
            fill="none"
            stroke={color.brand}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Icon>
        <Icon viewBox="0 0 24 24" width={19} height={19} style={orbStyle}>
          <Path
            d={ORB_PATH}
            fill="none"
            stroke={color.brand}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Icon>
      </View>
      <Text className="font-strong text-[11px] text-dim">{orb ? 'Orbe' : 'Onda'}</Text>
    </Pressable>
  )
}
