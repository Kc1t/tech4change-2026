import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useApp } from '../store'
import { color, font } from '../theme/tokens'

export function NotificationBell({ onPress }: { onPress: () => void }) {
  const count = useApp(s => s.unseenLearning.length)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        count > 0
          ? `${count} ${count === 1 ? 'palavra nova' : 'palavras novas'} no mapa`
          : 'Nada novo no mapa'
      }
      onPress={onPress}
      style={styles.bell}
      hitSlop={6}
    >
      <Svg viewBox="0 0 24 24" width={21} height={21}>
        <Path
          d="M18 8.6a6 6 0 1 0-12 0c0 4.2-1.4 5.6-2 6.3-.3.4 0 1 .5 1h15c.5 0 .8-.6.5-1-.6-.7-2-2.1-2-6.3Z"
          fill="none"
          stroke={color.dim}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10.2 19.4a2.1 2.1 0 0 0 3.6 0"
          fill="none"
          stroke={color.dim}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>

      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : String(count)}</Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', minHeight: 0 },
  badge: {
    position: 'absolute',
    right: 7,
    top: 7,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: color.brand,
    borderWidth: 2,
    borderColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: { fontFamily: font.bold, fontSize: 9, color: color.brandInk }
})
