import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { color, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

const SCREEN = 'px-6 pb-32'
const SCREEN_GAP = 12

export function Screen({
  children,
  scroll = true,
  gap = SCREEN_GAP
}: {
  children: React.ReactNode
  scroll?: boolean
  gap?: number
}) {
  const pad = { paddingTop: TOP_INSET, ...(gap > 0 ? { gap } : null) }

  if (!scroll) {
    return (
      <View className={SCREEN} style={pad}>
        {children}
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName={SCREEN}
      contentContainerStyle={pad}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}

export function ScreenTop({ children }: { children: React.ReactNode }) {
  return (
    <View className="px-6" style={{ paddingTop: TOP_INSET, gap: SCREEN_GAP }}>
      {children}
    </View>
  )
}

export function ScreenHeader({
  label,
  title,
  sub
}: {
  label?: string
  title: string
  sub?: string
}) {
  return (
    <View>
      {label ? (
        <Text className="mb-1.5 font-strong text-[11px] tracking-[1.4px] text-label">
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Text className="font-mid text-[26px] leading-[30px] tracking-[-0.9px] text-fg">{title}</Text>
      {sub ? <Text className="mt-2 font-mid text-[15px] leading-[22px] text-dim">{sub}</Text> : null}
    </View>
  )
}

export function Tabs<T extends string>({
  options,
  value,
  onChange
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <View className="flex-row self-start rounded-full bg-surface-2 p-1">
      {options.map(option => {
        const on = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 ${on ? 'bg-surface' : ''}`}
            style={on ? { ...shadow.card, shadowOpacity: 0.07 } : undefined}
          >
            <Text
              className={`text-[13px] ${on ? 'font-strong text-fg' : 'font-mid text-dim'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <View className="flex-row gap-1.5">
      {options.map(option => {
        const on = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            className={`min-h-tap flex-1 items-center justify-center rounded-card ${
              on ? 'bg-fg' : 'bg-surface-2'
            }`}
          >
            <Text className={`text-body ${on ? 'font-strong text-ink' : 'font-mid text-dim'}`}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function TopBar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View className="h-11 flex-row items-center justify-between">
      <View className="flex-row items-center gap-1">{left}</View>
      <View className="flex-row items-center gap-1">{right}</View>
    </View>
  )
}

export function BrandMark() {
  return (
    <Image
      source={require('../../assets/wordmark.png')}
      accessibilityLabel="eilo"
      resizeMode="contain"
      style={{ width: 72, height: 23 }}
    />
  )
}

export function BackButton({ onPress, label = 'Voltar' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1 py-2 pr-2"
      hitSlop={8}
    >
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
      <Text className="font-strong text-body text-dim">{label}</Text>
    </Pressable>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View className="rounded-large bg-surface p-5" style={[shadow.card, style]}>
      {children}
    </View>
  )
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
    <View className="flex-row justify-center">
      <View
        className="flex-row items-center gap-2 rounded-panel bg-surface px-[18px] py-3"
        style={{ ...shadow.card, shadowOpacity: 0.06 }}
      >
        <Sparkle />
        <Text className="shrink font-mid text-body text-dim" numberOfLines={1}>
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
    <Pressable
      onPress={onPress}
      className="min-h-tap flex-row items-center justify-between rounded-panel bg-surface px-4"
      style={{ ...shadow.card, shadowOpacity: 0.06 }}
    >
      <Text className={`font-strong text-body ${accent ? 'text-brand' : 'text-fg'}`}>
        {children}
      </Text>
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
