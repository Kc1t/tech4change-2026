import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { patternFor, pulse } from '../haptics'
import * as Speech from 'expo-speech'
import { BackdropToggle } from '../components/BackdropToggle'
import { GlassOrb } from '../components/GlassOrb'
import { AuroraField, type OrbState } from '../components/AuroraField'
import { Typed } from '../components/Typed'
import { BrandMark, ScreenTop, TopBar } from '../components/ui'
import { NotificationBell } from '../components/NotificationBell'
import { ActionTrail } from '../components/ActionTrail'
import { useDemoFlow } from '../hooks/useDemoFlow'
import { useListening } from '../hooks/useListening'
import { lifeGraph, useApp } from '../store'
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

  const { width } = useWindowDimensions()
  const orbSize = Math.min(width * 0.52, 200)
  const swap = useSharedValue(backdrop === 'orb' ? 1 : 0)

  useEffect(() => {
    swap.value = withTiming(backdrop === 'orb' ? 1 : 0, {
      duration: 460,
      easing: Easing.bezier(0.22, 1, 0.36, 1)
    })
  }, [backdrop, swap])

  const orbBox = useAnimatedStyle(() => ({
    height: swap.value * (orbSize + 36),
    opacity: swap.value,
    transform: [{ scale: 0.75 + swap.value * 0.25 }]
  }))

  const waveBox = useAnimatedStyle(() => ({ opacity: 1 - swap.value }))
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

  const deafen = useRef<(deaf: boolean) => void>(() => {})

  const show = useCallback(
    (text: string, caption: string, isWord: boolean) => {
      if (output !== 'voice') setFlash({ text, caption, isWord, id: Date.now() })
      if (output === 'text') return

      deafen.current(true)
      Speech.speak(text.replace('…', ''), {
        language: 'pt-BR',
        onDone: () => deafen.current(false),
        onStopped: () => deafen.current(false),
        onError: () => deafen.current(false)
      })
    },
    [output]
  )

  const handleSuccess = useCallback(() => {
    pulse('success', intensity)
    show(target.label, 'quem disse a palavra foi ela', true)
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
    pulse(patternFor(step.level, step.isFinal), intensity)
    show(step.text, `degrau ${step.level} · ${KIND_LABEL[step.kind]}`, false)
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
    target.label,
    target.id,
    start,
    advance,
    succeed,
    nextScene,
    intensity
  ])

  const { state: listening, start: listen, setDeaf } = useListening(trigger)
  deafen.current = setDeaf

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

  const status = demo.running && demo.heard
    ? 'ouvindo a frase'
    : resolved
    ? 'destravou'
    : !armed
      ? 'escuta desligada'
      : listening.denied
        ? 'modo toque'
        : listening.calibrating
          ? 'ajustando ao ambiente'
          : listening.noisy
            ? 'ambiente alto demais'
            : open
              ? `degrau ${level} de ${ladder.length}`
              : listening.speaking
                ? 'ouvindo a frase'
                : 'escutando'
  const expected = flash ? flash.text : resolved ? target.label : scene.attempt
  const expectedKind = flash?.isWord || resolved ? 'word' : flash ? 'cue' : 'waiting'

  const caption = resolved
    ? `Em ${resolvedAt} ${resolvedAt === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa mais longe.`
    : flash
      ? flash.caption
      : armed
        ? 'Toque quando a palavra não vier.'
        : 'Toque para eu começar a acompanhar. O áudio não sai do aparelho.'

  return (
    <View className="flex-1 bg-ink">
      <Animated.View className="absolute inset-x-0 bottom-0 h-[54%]" style={waveBox}>
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
            {demo.heard || scene.prompt}
          </Text>
        </View>
      </ScreenTop>

      <Pressable
        onPress={() => (armed ? trigger() : void listen())}
        accessibilityLabel={armed ? 'Travou — pedir ajuda agora' : 'Ativar a escuta'}
        className="flex-1 items-center justify-center px-6"
      >
        <Animated.View style={[{ overflow: 'hidden', alignItems: 'center' }, orbBox]}>
          {backdrop === 'orb' && <GlassOrb state={orbState} size={orbSize} />}
        </Animated.View>

        <ActionTrail actions={demo.actions} />

        <Text className="font-strong text-[11px] tracking-[1.4px] text-label">
          {expectedKind === 'word'
            ? 'A PALAVRA'
            : expectedKind === 'cue'
              ? 'O DEGRAU'
              : 'ESPERANDO A PALAVRA'}
        </Text>

        {expectedKind === 'word' ? (
          <Text className={`${EXPECTED} text-brand`}>{expected}</Text>
        ) : (
          <Typed
            text={expected}
            className={`${EXPECTED} ${expectedKind === 'waiting' ? 'text-faint' : 'text-fg'}`}
          />
        )}

        <Text className="mt-4 max-w-[300px] text-center font-book text-body leading-5 text-dim">
          {caption}
        </Text>
      </Pressable>

      <View className="items-center gap-3 pb-[132px]">
        {open && !resolved && (
          <Pressable onPress={handleSuccess} className="min-h-[44px] justify-center">
            <Text className="font-strong text-body text-dim">Consegui</Text>
          </Pressable>
        )}
        {resolved && (
          <Pressable onPress={trigger} className="min-h-[44px] justify-center">
            <Text className="font-strong text-body text-dim">Ver outra palavra</Text>
          </Pressable>
        )}
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
