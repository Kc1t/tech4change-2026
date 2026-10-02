import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { patternFor, pulse } from '../haptics'
import { prefetchVoice, speakVoice } from '../voice'
import { BackdropToggle } from '../components/BackdropToggle'
import { Buddy, type BuddyMood } from '../components/Buddy'
import { AuroraField, type OrbState } from '../components/AuroraField'
import { Typed } from '../components/Typed'
import { BrandMark, ScreenTop, TopBar } from '../components/ui'
import { NotificationBell } from '../components/NotificationBell'
import { ActionTrail } from '../components/ActionTrail'
import { useDemoFlow } from '../hooks/useDemoFlow'
import { useListening } from '../hooks/useListening'
import { recordEvent } from '../api/client'
import { CONFIDENCE_FLOOR, mentionsOf } from '../domain/predict'
import { silenceFor } from '../domain/comfort'
import { activeChannel, lifeGraph, useApp } from '../store'
import { broadcastCue, type CuePayload } from '../sync/client'
import { color } from '../theme/tokens'
import type { LadderStep } from '../domain/types'

const KIND_LABEL: Record<LadderStep['kind'], string> = {
  category: 'categoria',
  relation: 'relação',
  place: 'lugar',
  use: 'uso',
  shape: 'forma',
  phonological: 'pista sonora'
}

const EXPECTED =
  'mt-4 max-w-[300px] text-center font-mid text-[42px] leading-[46px] tracking-[-1.5px]'

const FOCUS_SCALE = 0.46
const SPEECH_TAIL = 72

const FLASH_MS = 5200
const RESUME_AFTER_WORD_MS = 4500
const WORD_FLASH_MS = 7000

function tailOf(text: string) {
  if (text.length <= SPEECH_TAIL) return text
  const cut = text.slice(-SPEECH_TAIL)
  return `…${cut.slice(cut.indexOf(' ') + 1)}`
}

interface Flash {
  text: string
  caption: string
  isWord: boolean
  id: number
}

export function MomentScreen({ onBell }: { onBell: () => void }) {
  const scene = useApp(s => s.scene())
  const targetId = useApp(s => s.target())
  const prediction = useApp(s => s.prediction)
  const hear = useApp(s => s.hear)
  const ladder = useApp(s => s.ladder)
  const level = useApp(s => s.level)
  const open = useApp(s => s.open)
  const output = useApp(s => s.output)
  const backdrop = useApp(s => s.backdrop)
  const helpLevel = useApp(s => s.helpLevel)
  const start = useApp(s => s.start)
  const advance = useApp(s => s.advance)
  const succeed = useApp(s => s.succeed)
  const nextScene = useApp(s => s.nextScene)
  const intensity = useApp(s => s.intensity)
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)
  const demoRequest = useApp(s => s.demoRequest)
  const loadDemo = useApp(s => s.loadDemo)
  const patience = useApp(s => s.patience)

  const { width } = useWindowDimensions()
  const orbSize = Math.min(width * 0.52, 200)
  const swap = useSharedValue(backdrop === 'orb' ? 1 : 0)

  useEffect(() => {
    swap.value = withTiming(backdrop === 'orb' ? 1 : 0, {
      duration: 460,
      easing: Easing.bezier(0.22, 1, 0.36, 1)
    })
  }, [backdrop, swap])

  const waveBox = useAnimatedStyle(() => ({ opacity: (1 - swap.value) * 0.5 }))
  const focus = useSharedValue(0)
  const buddyHeight = orbSize * 0.78 * 1.25
  const [pulseCount, setPulseCount] = useState(0)
  const [pressed, setPressed] = useState(false)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [resolvedAt, setResolvedAt] = useState<number | null>(null)
  const target = lifeGraph.nodes[targetId]!

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

  const deafen = useRef<(deaf: boolean) => void>(() => {})
  const transcriptRef = useRef('')
  const mentionsAtCue = useRef(0)

  const show = useCallback(
    (text: string, caption: string, isWord: boolean) => {
      if (output !== 'voice') setFlash({ text, caption, isWord, id: Date.now() })
      if (output === 'text') return

      deafen.current(true)
      speakVoice(text, () => deafen.current(false))
    },
    [output]
  )

  const handleSuccess = useCallback(() => {
    pulse('success', intensity)
    setPulseCount(count => count + 1)
    show(target.label, 'foi você que achou', true)
    const level = succeed()
    share({ targetId: target.id, level, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
    setResolvedAt(level)
  }, [show, succeed, share, target.label, target.id, intensity])

  const trigger = useCallback(() => {
    if (resolvedAt !== null) {
      setResolvedAt(null)
      setFlash(null)
      nextScene()
      return
    }

    if (helpLevel === 'deliver') {
      pulse('success', intensity)
      show(target.label, 'aqui está a palavra', true)
      setResolvedAt(succeed(0))
      share({ targetId: target.id, level: 0, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
      return
    }

    if (!useApp.getState().open) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      mentionsAtCue.current = mentionsOf(target, transcriptRef.current)
      void start()
    } else {
      const state = useApp.getState()
      if (state.level >= state.ladder.length) return
      advance()
    }

    const next = useApp.getState()
    const step = next.ladder[next.level - 1]
    if (!step) return
    pulse(patternFor(step.level, step.isFinal), intensity)
    setPulseCount(count => count + 1)
    show(step.text, `pista ${step.level} · ${KIND_LABEL[step.kind]}`, false)
    recordEvent({
      targetId: next.target(),
      event: 'step',
      level: step.level,
      origin: next.origin,
      channel: activeChannel(next.channels),
      elapsedMs: next.startedAt ? Date.now() - next.startedAt : 0
    })
    share({
      targetId: target.id,
      level: step.level,
      attr: step.attr,
      edge: step.edgeId,
      isFinal: step.isFinal,
      event: 'cue'
    })
  }, [
    helpLevel,
    resolvedAt,
    show,
    share,
    target,
    start,
    advance,
    succeed,
    nextScene,
    intensity
  ])

  const keyterms = useMemo(
    () => Object.values(lifeGraph.nodes).flatMap(node => [node.label, ...(node.aliases ?? [])]),
    []
  )
  const {
    state: listening,
    start: listen,
    stop: unlisten,
    setDeaf
  } = useListening(trigger, keyterms, silenceFor(patience))

  useEffect(() => {
    deafen.current = setDeaf
  }, [setDeaf])

  useEffect(() => {
    transcriptRef.current = listening.transcript
    hear(listening.transcript)
    if (!useApp.getState().open || resolvedAt !== null) return
    const mentions = mentionsOf(target, listening.transcript)
    if (mentions < mentionsAtCue.current) mentionsAtCue.current = mentions
    else if (mentions > mentionsAtCue.current) handleSuccess()
  }, [listening.transcript, hear, target, resolvedAt, handleSuccess])

  useEffect(() => {
    if (resolvedAt === null) return
    const timer = setTimeout(() => {
      setResolvedAt(null)
      setFlash(null)
      nextScene()
    }, RESUME_AFTER_WORD_MS)
    return () => clearTimeout(timer)
  }, [resolvedAt, nextScene])

  useEffect(() => {
    if (output === 'text') return
    prefetchVoice([target.label, ...ladder.map(step => step.text)])
  }, [output, target.label, ladder])

  const { demo, start: runDemo } = useDemoFlow({
    onCue: trigger,
    onResolve: handleSuccess,
    onLearn: loadDemo
  })

  const seenDemo = useRef<number | null>(null)

  useEffect(() => {
    if (seenDemo.current === null) {
      seenDemo.current = demoRequest
      return
    }
    if (demoRequest === seenDemo.current) return
    seenDemo.current = demoRequest
    runDemo()
  }, [demoRequest, runDemo])

  const armed = listening.active || listening.denied || demo.running
  const guess = prediction.targetId ? lifeGraph.nodes[prediction.targetId] : null
  const confident = guess !== undefined && guess !== null && prediction.confidence >= CONFIDENCE_FLOOR
  const heard = listening.transcript.trim()
  const resolved = resolvedAt !== null
  const orbState: OrbState = resolved
    ? 'delivering'
    : flash
      ? 'blocked'
      : listening.speaking
        ? 'speaking'
        : armed || open
          ? 'listening'
          : 'off'

  const mood: BuddyMood = resolved
    ? 'happy'
    : !armed
      ? 'asleep'
      : flash && !flash.isWord
        ? 'cue'
        : confident && !open
          ? 'guess'
          : listening.speaking
            ? 'speaking'
            : 'listening'

  const status = demo.running && demo.heard
    ? 'ouvindo a frase'
    : !armed
      ? 'a escuta está em pausa'
      : listening.denied
        ? 'é só tocar quando precisar'
        : listening.calibrating
          ? 'me acostumando com o ambiente'
          : listening.noisy
            ? 'está um pouco barulhento'
            : open
              ? `pista ${level} de ${ladder.length}`
              : confident
                ? 'acho que sei qual é'
                : listening.speaking
                  ? 'ouvindo a frase'
                  : 'ouvindo com você'
  const expected = flash
    ? flash.text
    : resolved
      ? target.label
      : confident
        ? guess.label
        : scene.attempt
  const expectedKind = flash?.isWord || resolved ? 'word' : flash ? 'cue' : 'waiting'

  const speech = demo.heard || (armed ? heard : '')
  const focused = armed && (speech.length > 0 || open || resolved)
  const showExpected = !focused || expectedKind !== 'waiting' || confident

  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, { duration: 520, easing: Easing.bezier(0.22, 1, 0.36, 1) })
  }, [focused, focus])

  const buddyBox = useAnimatedStyle(() => ({
    height: buddyHeight * (1 - (1 - FOCUS_SCALE) * focus.value),
    justifyContent: 'center',
    alignItems: 'center'
  }))

  const buddyScale = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - FOCUS_SCALE) * focus.value }]
  }))

  const speechStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ translateY: (1 - focus.value) * 12 }]
  }))

  const caption = resolved
    ? resolvedAt === 0
      ? 'Saiu sem nenhuma pista.'
      : `Você chegou lá com ${resolvedAt} ${resolvedAt === 1 ? 'pista' : 'pistas'}. A cada vez fica mais fácil.`
    : flash
      ? flash.caption
      : armed
        ? 'Se a palavra não vier, é só tocar. Sem pressa.'
        : 'Toque quando quiser que eu acompanhe a conversa. Nada é gravado.'

  return (
    <View className="flex-1 bg-ink">
      <Animated.View className="absolute inset-x-0 bottom-0 h-[34%]" style={waveBox}>
        <AuroraField state={orbState} level={listening.speaking ? 0.62 : armed ? 0.3 : 0} />
      </Animated.View>

      <ScreenTop>
        <TopBar
          left={<BrandMark />}
          right={
            <>
              <BackdropToggle />
              <NotificationBell onPress={onBell} />
            </>
          }
        />
        <View>
          <Text className="font-strong text-[11px] tracking-[1.4px] text-label">
            {status.toUpperCase()}
          </Text>
          <Text className="mt-2 max-w-[300px] font-book text-[19px] leading-[26px] text-dim">
            {focused && speech !== scene.prompt ? scene.prompt : focused ? '' : speech || scene.prompt}
          </Text>
          {listening.active && !demo.running && (
            <Pressable
              onPress={unlisten}
              accessibilityRole="button"
              accessibilityLabel="Pausar a escuta"
              hitSlop={8}
              className="mt-3 min-h-tap flex-row items-center gap-2 self-start"
            >
              <View className="size-2 rounded-full bg-brand" />
              <Text className="font-strong text-hint text-dim">Pausar a escuta</Text>
            </Pressable>
          )}
        </View>
      </ScreenTop>

      <Pressable
        onPress={() => (armed ? trigger() : void listen())}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityLabel={armed ? 'Travou — pedir ajuda agora' : 'Ativar a escuta'}
        className="flex-1 items-center justify-center px-6"
      >
        <Animated.View style={buddyBox}>
          <Animated.View style={buddyScale}>
            <Buddy size={orbSize * 0.78} mood={mood} level={listening.speaking ? 0.6 : 0} pulse={pulseCount} pressed={pressed} />
          </Animated.View>
        </Animated.View>

        <ActionTrail actions={demo.actions} />

        {focused && speech.length > 0 && (
          <Animated.View style={[speechStyle, { marginTop: 8, marginBottom: 22, alignItems: 'center' }]}>
            <Text
              accessibilityLiveRegion="polite"
              className={`max-w-[320px] text-center ${
                expectedKind === 'waiting'
                  ? 'font-mid text-[28px] leading-[36px] tracking-[-0.6px] text-fg'
                  : 'font-book text-[17px] leading-[24px] text-dim'
              }`}
            >
              {tailOf(speech)}
            </Text>
          </Animated.View>
        )}

        {showExpected && (
          <>
            <Text className="font-strong text-[11px] tracking-[1.4px] text-label">
              {expectedKind === 'word'
                ? 'A PALAVRA'
                : expectedKind === 'cue'
                  ? 'UMA PISTA'
                  : confident && focused
                    ? 'SERÁ QUE É'
                    : 'NO SEU TEMPO'}
            </Text>

            {expectedKind === 'word' ? (
              <Text className={`${EXPECTED} text-brand`}>{expected}</Text>
            ) : (
              <Typed
                text={expected}
                className={`${EXPECTED} ${expectedKind === 'waiting' ? 'text-faint' : 'text-fg'}`}
              />
            )}
          </>
        )}

        <Text className="mt-4 max-w-[300px] text-center font-book text-body leading-5 text-dim">
          {caption}
        </Text>
      </Pressable>

      <View className="items-center gap-3 pb-[132px]">
        <View className="flex-row gap-1.5">
          {ladder.map(step => (
            <View
              key={step.level}
              className={`size-1.5 rounded-full ${
                step.level <= level ? 'bg-brand' : 'bg-line'
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  )
}
