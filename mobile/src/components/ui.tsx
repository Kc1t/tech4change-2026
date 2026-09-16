import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { color, font, radius, shadow, tap } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

export function Screen({
  children,
  scroll = true,
  gap = 0
}: {
  children: React.ReactNode
  scroll?: boolean
  gap?: number
}) {
  if (!scroll) {
    return <View style={[styles.screen, gap > 0 && { gap }]}>{children}</View>
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.screen, gap > 0 && { gap }]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}

export function ScreenHeader({
  label,
  title,
  sub
}: {
  label: string
  title: string
  sub?: string
}) {
  return (
    <View>
      <Text style={styles.labelCaps}>{label.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  )
}

export function TopBar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>{left}</View>
      <View style={styles.topBarSide}>{right}</View>
    </View>
  )
}

export function BrandMark() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark} />
      <Text style={styles.brandText}>eilo</Text>
    </View>
  )
}

export function BackButton({ onPress, label = 'Voltar' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} style={styles.back} hitSlop={8}>
      <Svg viewBox="0 0 20 20" width={16} height={16}>
        <Path
          d="M12 4.5 6.5 10l5.5 5.5"
          fill="none"
          stroke={color.dim}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Sparkle({ muted = false, size = 18 }: { muted?: boolean; size?: number }) {
  const stroke = muted ? color.line : color.masteryHigh
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M12 3v18m9-9H3" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M18.364 5.636 5.636 18.364m12.728 0L5.636 5.636"
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  )
}

export function Insight({ children }: { children: string }) {
  return (
    <View style={styles.insightRow}>
      <View style={styles.insight}>
        <Sparkle />
        <Text style={styles.insightText} numberOfLines={1}>
          {children}
        </Text>
      </View>
    </View>
  )
}

export function RowLink({
  children,
  onPress,
  accent = false
}: {
  children: string
  onPress: () => void
  accent?: boolean
}) {
  return (
    <Pressable onPress={onPress} style={styles.rowLink}>
      <Text style={[styles.rowLinkText, accent && { color: color.brand }]}>{children}</Text>
      <Svg viewBox="0 0 20 20" width={16} height={16}>
        <Path
          d="m7.5 4.5 5.5 5.5-5.5 5.5"
          fill="none"
          stroke={color.faint}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingHorizontal: 24, paddingBottom: 128, paddingTop: TOP_INSET },
  labelCaps: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label
  },
  title: {
    fontFamily: font.medium,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.9,
    color: color.fg,
    marginTop: 6
  },
  sub: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 22,
    color: color.dim,
    marginTop: 8
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topBarSide: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: color.brandRose,
    transform: [{ rotate: '45deg' }]
  },
  brandText: {
    fontFamily: font.semibold,
    fontSize: 18,
    letterSpacing: -0.72,
    color: color.fg
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingRight: 8 },
  backText: { fontFamily: font.semibold, fontSize: 14, color: color.dim },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.large,
    padding: 20,
    ...shadow.card
  },
  insightRow: { flexDirection: 'row', justifyContent: 'center' },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  insightText: { fontFamily: font.medium, fontSize: 14, color: color.dim, flexShrink: 1 },
  rowLink: {
    minHeight: tap.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  rowLinkText: { fontFamily: font.semibold, fontSize: 14, color: color.fg }
})
