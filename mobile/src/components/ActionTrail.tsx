import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import Svg, { Circle, Path } from 'react-native-svg'
import { color } from '../theme/tokens'
import type { ActionTone, DemoAction } from '../domain/demoFlow'

const TINT: Record<ActionTone, string> = {
  ear: color.dim,
  think: color.brand,
  voice: color.brand,
  buzz: color.brand,
  map: color.masteryHigh
}

function Glyph({ tone }: { tone: ActionTone }) {
  const stroke = {
    fill: 'none',
    stroke: TINT[tone],
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  }

  return (
    <Svg viewBox="0 0 24 24" width={12} height={12}>
      {tone === 'ear' && (
        <Path d="M8 9a4 4 0 1 1 8 0c0 2.5-2.6 3-2.6 5.4M12 19h.01" {...stroke} />
      )}
      {tone === 'think' && (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path d="M12 3v4M12 17v4M3 12h4M17 12h4" {...stroke} />
        </>
      )}
      {tone === 'voice' && <Path d="M3 12h2.4M8 7.5v9M12 4.5v15M16 8.5v7M18.6 12H21" {...stroke} />}
      {tone === 'buzz' && (
        <Path d="M9.5 5.5h5v13h-5zM5.5 9.5v5M18.5 9.5v5" {...stroke} />
      )}
      {tone === 'map' && <Path d="M4.5 12.5l4.5 4.5 10-10" {...stroke} />}
    </Svg>
  )
}

const FADE = [1, 0.46, 0.24]

export function ActionTrail({ actions }: { actions: DemoAction[] }) {
  if (actions.length === 0) return null

  return (
    <View className="mb-4 items-center gap-1" style={{ alignSelf: 'stretch' }}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.id}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          style={{ opacity: FADE[actions.length - 1 - index] ?? 0.24 }}
        >
          <View className="flex-row items-center gap-1.5 rounded-full bg-surface px-2.5 py-1">
            <Glyph tone={action.tone} />
            <Text className="font-strong text-[10.5px]" style={{ color: TINT[action.tone] }}>
              {action.label}
            </Text>
          </View>
        </Animated.View>
      ))}
    </View>
  )
}
