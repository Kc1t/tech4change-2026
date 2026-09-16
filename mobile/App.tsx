import { useCallback, useEffect, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Speech from 'expo-speech'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  useFonts
} from '@expo-google-fonts/manrope'
import { Aurora, type OrbState } from './src/components/Aurora'
import { lifeGraph, useApp } from './src/store'
import type { HelpLevel, LadderStep, OutputMode } from './src/domain/types'
import { color, font, radius, tap } from './src/theme/tokens'

const HELP_OPTIONS: Array<{ value: HelpLevel; label: string }> = [
  { value: 'deliver', label: 'Entrega' },
  { value: 'hint', label: 'Dica' },
  { value: 'ladder', label: 'Escada' }
]

const OUTPUT_OPTIONS: Array<{ value: OutputMode; label: string }> = [
  { value: 'voice', label: 'Voz' },
  { value: 'text', label: 'Texto' },
  { value: 'both', label: 'Ambos' }
]

const KIND_LABEL: Record<LadderStep['kind'], string> = {
  category: 'categoria',
  relation: 'relação',
  place: 'lugar',
  use: 'uso',
  shape: 'forma',
  phonological: 'pista sonora'
}

const FLASH_MS = 5200
const WORD_FLASH_MS = 7000

interface Flash {
  text: string
  caption: string
  isWord: boolean
  id: number
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold
  })

  const { width } = useWindowDimensions()
  const scene = useApp(s => s.scene())
  const ladder = useApp(s => s.ladder)
  const level = useApp(s => s.level)
  const open = useApp(s => s.open)
  const helpLevel = useApp(s => s.helpLevel)
  const output = useApp(s => s.output)
  const start = useApp(s => s.start)
  const advance = useApp(s => s.advance)
  const succeed = useApp(s => s.succeed)
  const nextScene = useApp(s => s.nextScene)
  const setHelpLevel = useApp(s => s.setHelpLevel)
  const setOutput = useApp(s => s.setOutput)

  const [flash, setFlash] = useState<Flash | null>(null)
  const [resolvedAt, setResolvedAt] = useState<number | null>(null)
  const target = lifeGraph.nodes[scene.targetId]!

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(
      () => setFlash(current => (current?.id === flash.id ? null : current)),
      flash.isWord ? WORD_FLASH_MS : FLASH_MS
    )
    return () => clearTimeout(timer)
  }, [flash])

  const show = useCallback(
    (text: string, caption: string, isWord: boolean) => {
      if (output !== 'voice') setFlash({ text, caption, isWord, id: Date.now() })
      if (output !== 'text') Speech.speak(text.replace('…', ''), { language: 'pt-BR' })
    },
    [output]
  )

  const handleSuccess = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    show(target.label, 'quem disse a palavra foi ela', true)
    setResolvedAt(succeed())
  }, [show, succeed, target.label])

  const trigger = useCallback(() => {
    if (resolvedAt !== null) return

    if (helpLevel === 'deliver') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      show(target.label, 'entregue direto — modo conversa', true)
      setResolvedAt(succeed(0))
      return
    }

    if (!useApp.getState().open) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      start()
    } else {
      const state = useApp.getState()
      if (state.level >= state.ladder.length) return
      advance()
    }

    const next = useApp.getState()
    const step = next.ladder[next.level - 1]
    if (!step) return
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    show(step.text, `degrau ${step.level} · ${KIND_LABEL[step.kind]}`, false)
  }, [helpLevel, resolvedAt, show, target.label, start, advance, succeed])

  if (!fontsLoaded) return <View style={styles.screen} />

  const resolved = resolvedAt !== null
  const orbState: OrbState = resolved
    ? 'delivering'
    : flash
      ? 'blocked'
      : open
        ? 'listening'
        : 'off'

  const headline = flash ? flash.text : resolved ? target.label : scene.prompt
  const caption = flash
    ? flash.caption
    : resolved
      ? `Em ${resolvedAt} ${resolvedAt === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa mais longe.`
      : open
        ? `Degrau ${level} de ${ladder.length}.`
        : 'A escuta roda em segundo plano. A palavra aparece e some, para não poluir a tela.'

  const pill = resolved
    ? { title: 'Ver outra palavra', sub: 'começar de novo' }
    : open
      ? { title: 'Travou?', sub: 'toque e a dica vem' }
      : { title: 'Ativar a escuta', sub: 'toque para começar' }

  const orbSize = width * 1.5

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={color.ink} />

      <View
        style={[
          styles.orbWrap,
          {
            width: orbSize,
            height: orbSize,
            left: (width - orbSize) / 2,
            bottom: -orbSize * 0.34
          }
        ]}
      >
        <Aurora state={orbState} size={orbSize} />
      </View>

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark} />
            <Text style={styles.brandText}>eilo</Text>
          </View>
          <View style={styles.menu}>
            <View style={styles.menuBar} />
            <View style={[styles.menuBar, styles.menuBarShort]} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.labelCaps}>{scene.speaker.toUpperCase()}</Text>
          <Text style={[styles.h1, (flash?.isWord || resolved) && styles.h1Accent]}>
            {headline}
          </Text>
          <Text style={styles.sub}>{caption}</Text>

          {open && !resolved && (
            <Pressable onPress={handleSuccess} style={styles.secondary}>
              <Text style={styles.secondaryText}>Consegui</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.modes}>
          <Modes label="ajuda" value={helpLevel} options={HELP_OPTIONS} onChange={setHelpLevel} />
          <Modes label="saída" value={output} options={OUTPUT_OPTIONS} onChange={setOutput} />
        </View>

        <View style={styles.spacer} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${pill.title} — ${pill.sub}`}
          onPress={() => {
            if (resolved) {
              setResolvedAt(null)
              setFlash(null)
              nextScene()
              return
            }
            trigger()
          }}
          style={styles.pill}
        >
          <View style={styles.play}>
            <View style={open && !resolved ? styles.pauseIcon : styles.playIcon} />
          </View>
          <View>
            <Text style={styles.pillTitle}>{pill.title}</Text>
            <Text style={styles.pillSub}>{pill.sub}</Text>
          </View>
        </Pressable>
      </SafeAreaView>
    </View>
  )
}

function Modes<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (next: T) => void
}) {
  return (
    <View style={styles.modeRow}>
      <Text style={styles.modeLabel}>{label.toUpperCase()}</Text>
      {options.map(option => {
        const active = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink, overflow: 'hidden' },
  orbWrap: { position: 'absolute' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 18
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: color.accentRose,
    transform: [{ rotate: '45deg' }]
  },
  brandText: {
    fontFamily: font.semibold,
    fontSize: 19,
    letterSpacing: -0.76,
    color: color.fg
  },
  menu: { width: 32, height: 20, justifyContent: 'center', gap: 6 },
  menuBar: { height: 1.5, borderRadius: 2, backgroundColor: color.fg },
  menuBarShort: { width: '70%', alignSelf: 'flex-end' },
  copy: { paddingHorizontal: 28, paddingTop: 28 },
  labelCaps: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label
  },
  h1: {
    fontFamily: font.medium,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.91,
    color: color.fg,
    marginTop: 12,
    maxWidth: 260
  },
  h1Accent: { color: color.accent },
  sub: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: color.faint,
    marginTop: 12,
    maxWidth: 280
  },
  secondary: { marginTop: 8, minHeight: tap.min, justifyContent: 'center' },
  secondaryText: { fontFamily: font.semibold, fontSize: 14, color: color.dim },
  modes: { paddingHorizontal: 20, marginTop: 16, gap: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modeLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label,
    width: 56,
    paddingLeft: 8
  },
  chip: {
    minHeight: tap.min,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    justifyContent: 'center'
  },
  chipActive: { backgroundColor: color.glass },
  chipText: { fontFamily: font.medium, fontSize: 13, color: color.faint },
  chipTextActive: { fontFamily: font.semibold, color: color.fg },
  spacer: { flex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginLeft: 18,
    marginBottom: 22,
    paddingLeft: 6,
    paddingRight: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: color.glass
  },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.fg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: color.ink
  },
  pauseIcon: {
    width: 10,
    height: 12,
    borderLeftWidth: 3.5,
    borderRightWidth: 3.5,
    borderColor: color.ink
  },
  pillTitle: { fontFamily: font.semibold, fontSize: 12, color: color.fg },
  pillSub: { fontFamily: font.regular, fontSize: 10, color: color.dim, marginTop: 1 }
})
