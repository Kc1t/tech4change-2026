import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Speech from 'expo-speech'
import { AuroraField, type OrbState } from '../components/AuroraField'
import { BrandMark, TopBar } from '../components/ui'
import { NotificationBell } from '../components/NotificationBell'
import { lifeGraph, useApp } from '../store'
import { broadcastCue, type CuePayload } from '../sync/client'
import { color, font } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'
import type { LadderStep } from '../domain/types'

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

export function MomentScreen({ onBell }: { onBell: () => void }) {
  const scene = useApp(s => s.scene())
  const ladder = useApp(s => s.ladder)
  const level = useApp(s => s.level)
  const open = useApp(s => s.open)
  const output = useApp(s => s.output)
  const helpLevel = useApp(s => s.helpLevel)
  const start = useApp(s => s.start)
  const advance = useApp(s => s.advance)
  const succeed = useApp(s => s.succeed)
  const nextScene = useApp(s => s.nextScene)
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)

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

  const share = useCallback(
    (payload: Omit<CuePayload, 'deviceId'>) => {
      if (!sessionCode || !deviceId) return
      broadcastCue(sessionCode, { deviceId, ...payload })
    },
    [sessionCode, deviceId]
  )

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
    const level = succeed()
    share({ targetId: target.id, level, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
    setResolvedAt(level)
  }, [show, succeed, share, target.label, target.id])

  const trigger = useCallback(() => {
    if (resolvedAt !== null) {
      setResolvedAt(null)
      setFlash(null)
      nextScene()
      return
    }

    if (helpLevel === 'deliver') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      show(target.label, 'entregue direto — modo conversa', true)
      setResolvedAt(succeed(0))
      share({ targetId: target.id, level: 0, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
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
    share({
      targetId: target.id,
      level: step.level,
      attr: step.attr,
      edge: step.edgeId,
      isFinal: step.isFinal,
      event: 'cue'
    })
  }, [helpLevel, resolvedAt, show, share, target.label, target.id, start, advance, succeed, nextScene])

  const resolved = resolvedAt !== null
  const orbState: OrbState = resolved
    ? 'delivering'
    : flash
      ? 'blocked'
      : open
        ? 'listening'
        : 'off'

  const status = resolved ? 'destravou' : open ? `degrau ${level} de ${ladder.length}` : 'escuta desligada'
  const expected = flash ? flash.text : resolved ? target.label : scene.attempt
  const expectedKind = flash?.isWord || resolved ? 'word' : flash ? 'cue' : 'waiting'

  const caption = resolved
    ? `Em ${resolvedAt} ${resolvedAt === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa mais longe.`
    : flash
      ? flash.caption
      : 'Toque quando a palavra não vier.'

  return (
    <View style={styles.screen}>
      <View style={styles.aurora}>
        <AuroraField state={orbState} level={open ? 0.3 : 0} />
      </View>

      <View style={styles.top}>
        <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />
        <Text style={styles.status}>{status.toUpperCase()}</Text>
        <Text style={styles.prompt}>{scene.prompt}</Text>
      </View>

      <Pressable onPress={trigger} style={styles.center}>
        <Text style={styles.centerLabel}>
          {expectedKind === 'word'
            ? 'A PALAVRA'
            : expectedKind === 'cue'
              ? 'O DEGRAU'
              : 'ESPERANDO A PALAVRA'}
        </Text>

        <Text
          style={[
            styles.expected,
            expectedKind === 'word' && { color: color.brand },
            expectedKind === 'waiting' && { color: color.faint }
          ]}
        >
          {expected}
        </Text>

        <Text style={styles.caption}>{caption}</Text>
      </Pressable>

      <View style={styles.bottom}>
        {open && !resolved && (
          <Pressable onPress={handleSuccess} style={styles.secondary}>
            <Text style={styles.secondaryText}>Consegui</Text>
          </Pressable>
        )}
        {resolved && (
          <Pressable onPress={trigger} style={styles.secondary}>
            <Text style={styles.secondaryText}>Ver outra palavra</Text>
          </Pressable>
        )}
        <View style={styles.ladderDots}>
          {ladder.map(step => (
            <View
              key={step.level}
              style={[
                styles.dot,
                step.level <= level && { backgroundColor: color.brand }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  aurora: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '54%' },
  top: { paddingHorizontal: 24, paddingTop: TOP_INSET },
  status: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label,
    marginTop: 12
  },
  prompt: {
    fontFamily: font.regular,
    fontSize: 19,
    lineHeight: 26,
    color: color.dim,
    marginTop: 8,
    maxWidth: 300
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  centerLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.4, color: color.label },
  expected: {
    fontFamily: font.medium,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.5,
    textAlign: 'center',
    color: color.fg,
    marginTop: 16,
    maxWidth: 300
  },
  caption: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: color.dim,
    marginTop: 16,
    maxWidth: 300
  },
  bottom: { alignItems: 'center', paddingBottom: 132, gap: 12 },
  secondary: { minHeight: 44, justifyContent: 'center' },
  secondaryText: { fontFamily: font.semibold, fontSize: 14, color: color.dim },
  ladderDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.line }
})
