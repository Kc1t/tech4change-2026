'use client'

import { useCallback, useEffect, useState } from 'react'
import { lifeGraph, useApp } from '@/store'
import { notifyWatch, patternFor, pulse, speak, unlockAudio, vibrate } from '@/channels'
import { recordEvent } from '@/api/client'
import type { OrbState } from '@/components/Orb'
import { AuroraField } from '@/components/AuroraField'
import { LearningCard } from '@/components/LearningCard'
import { useListening } from '@/hooks/useListening'
import { cueFor } from '@/domain/haptics'
import { speakEntrained, stopEntrainment } from '@/channels/entrain'
import { broadcastCue } from '@/sync/client'
import type { HelpLevel, LadderStep, OutputMode } from '@/domain/types'
import { BrandMark, NotificationBell, TopBar } from '@/components/layout'

const HELP_OPTIONS: Array<{ value: HelpLevel; label: string; hint: string }> = [
  { value: 'deliver', label: 'Entrega', hint: 'diz a palavra' },
  { value: 'hint', label: 'Dica', hint: 'um degrau' },
  { value: 'ladder', label: 'Escada', hint: 'degrau a degrau' }
]

const OUTPUT_OPTIONS: Array<{ value: OutputMode; label: string; hint: string }> = [
  { value: 'voice', label: 'Voz', hint: 'só no fone' },
  { value: 'text', label: 'Texto', hint: 'só na tela' },
  { value: 'both', label: 'Ambos', hint: 'fone e tela' }
]

const KIND_LABEL: Record<LadderStep['kind'], string> = {
  category: 'categoria',
  relation: 'relação',
  place: 'lugar',
  use: 'uso',
  shape: 'forma',
  phonological: 'pista sonora'
}

const SOURCE_LABEL: Record<string, string> = {
  photo: 'foto',
  audio: 'áudio',
  message: 'mensagem',
  family: 'família'
}

const FLASH_MS = 5200
const WORD_FLASH_MS = 7000

interface Flash {
  text: string
  caption: string
  source: string | null
  isWord: boolean
  id: number
}

export function MomentScreen() {
  const scene = useApp(s => s.scene())
  const ladder = useApp(s => s.ladder)
  const level = useApp(s => s.level)
  const open = useApp(s => s.open)
  const channels = useApp(s => s.channels)
  const discretion = useApp(s => s.discretion)
  const intensity = useApp(s => s.intensity)
  const helpLevel = useApp(s => s.helpLevel)
  const output = useApp(s => s.output)
  const start = useApp(s => s.start)
  const advance = useApp(s => s.advance)
  const succeed = useApp(s => s.succeed)
  const nextScene = useApp(s => s.nextScene)
  const setHelpLevel = useApp(s => s.setHelpLevel)
  const setOutput = useApp(s => s.setOutput)
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)
  const cueRequest = useApp(s => s.cueRequest)

  const [flash, setFlash] = useState<Flash | null>(null)
  const [resolvedAt, setResolvedAt] = useState<number | null>(null)
  const target = lifeGraph.nodes[scene.targetId]!

  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(
      () => setFlash(current => (current?.id === flash.id ? null : current)),
      flash.isWord ? WORD_FLASH_MS : FLASH_MS
    )
    return () => window.clearTimeout(timer)
  }, [flash])

  const show = useCallback(
    (
      text: string,
      caption: string,
      isWord: boolean,
      source: string | null = null,
      entrain = false
    ): boolean => {
      if (output !== 'voice') setFlash({ text, caption, source, isWord, id: performance.now() })
      if (output === 'text') return false
      const spoken = text.replace('…', '')
      if (entrain && speakEntrained(spoken, channels, discretion, intensity)) return true
      speak(spoken, channels, discretion)
      return false
    },
    [output, channels, discretion, intensity]
  )

  const share = useCallback(
    (payload: { targetId: string; level: number; attr: string; edge: string | null; isFinal: boolean; event: 'cue' | 'resolved' }) => {
      if (!sessionCode || !deviceId) return
      broadcastCue(sessionCode, { deviceId, ...payload })
    },
    [sessionCode, deviceId]
  )

  const deliver = useCallback(() => {
    const entrained = show(target.label, 'entregue direto — modo conversa', true, null, true)
    if (!entrained) vibrate('success', channels, intensity)
    void notifyWatch(target.label, 'entregue direto', channels)
    share({ targetId: target.id, level: 0, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
    setResolvedAt(succeed(0))
  }, [channels, intensity, show, target.label, target.id, succeed, share])

  const emit = useCallback(
    (index: number, silent = false) => {
      const step = useApp.getState().ladder[index]
      if (!step) return
      const source = step.provenance
        ? `${SOURCE_LABEL[step.provenance.source] ?? step.provenance.source} · ${step.provenance.detail}`
        : null
      const entrained = show(step.text, `degrau ${step.level} · ${KIND_LABEL[step.kind]}`, false, source, true)
      if (!silent && !entrained) vibrate(patternFor(step.level, step.isFinal), channels, intensity)
      void notifyWatch(`Degrau ${step.level}`, step.text, channels)
      const state = useApp.getState()
      share({
        targetId: state.target(),
        level: step.level,
        attr: step.attr,
        edge: step.edgeId,
        isFinal: step.isFinal,
        event: 'cue'
      })
      void recordEvent({
        targetId: state.target(),
        event: 'step',
        level: step.level,
        origin: state.origin,
        channel: channels.earbuds ? 'earbuds' : channels.watch ? 'watch' : 'phone',
        elapsedMs: state.startedAt ? Date.now() - state.startedAt : 0
      })
    },
    [channels, intensity, show, share]
  )

  const trigger = useCallback(() => {
    if (resolvedAt !== null) return
    unlockAudio()

    if (helpLevel === 'deliver') {
      deliver()
      return
    }

    if (!useApp.getState().open) {
      const signature = cueFor(target.label, useApp.getState().learningFor(target.id), target.phon)
      const felt = pulse(signature.pattern, channels, intensity, true)
      void start()
      emit(useApp.getState().level - 1, felt)
      return
    }

    const state = useApp.getState()
    if (state.level >= state.ladder.length) return
    advance()
    emit(useApp.getState().level - 1)
  }, [helpLevel, resolvedAt, deliver, start, advance, emit, channels, intensity, target])

  const { levelRef, state: listening, start: listen, stop: unlisten } = useListening(trigger)

  function handleSuccess() {
    stopEntrainment()
    vibrate('success', channels, intensity)
    show(target.label, 'quem disse a palavra foi ela', true)
    share({ targetId: target.id, level, attr: 'phon', edge: null, isFinal: true, event: 'resolved' })
    setResolvedAt(succeed())
  }

  function handleNext() {
    stopEntrainment()
    setResolvedAt(null)
    setFlash(null)
    nextScene()
  }

  const manual = listening.denied && !listening.active
  const armed = listening.active || manual

  const orbState: OrbState = !armed
    ? 'off'
    : flash?.isWord
      ? 'delivering'
      : flash
        ? 'blocked'
        : listening.speaking
          ? 'speaking'
          : 'listening'

  const resolved = resolvedAt !== null

  useEffect(() => {
    if (cueRequest === 0) return
    if (resolved) {
      setResolvedAt(null)
      setFlash(null)
      nextScene()
      return
    }
    if (!armed) {
      void listen()
      return
    }
    trigger()
  }, [cueRequest])

  const status = resolved
    ? 'destravou'
    : flash
      ? flash.caption
      : !armed
        ? 'escuta desligada'
        : manual
          ? 'modo toque'
          : listening.calibrating
            ? 'ajustando ao ambiente'
            : listening.noisy
              ? 'ambiente alto demais'
              : listening.speaking
                ? 'ouvindo a frase'
                : 'escutando'

  const heard = listening.transcript.trim()
  const spoken = armed && heard ? heard : scene.prompt

  const expected = flash
    ? flash.text
    : resolved
      ? target.label
      : scene.attempt

  const expectedKind = flash?.isWord || resolved ? 'word' : flash ? 'cue' : 'waiting'

  return (
    <section className="relative flex h-full flex-col overflow-hidden">
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[54%]">
        <AuroraField state={orbState} levelRef={levelRef} />
      </span>

      <div className="relative z-10 px-7 pt-[calc(10px+env(safe-area-inset-top,0px))]">
        <TopBar left={<BrandMark />} right={<NotificationBell />} />
      </div>

      <div className="relative z-10 px-7 pt-3">
        <p className="label-caps">{status}</p>
        <p className="mt-2 max-w-[26ch] text-[19px] leading-snug text-dim">
          {spoken}
          {armed && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[0.9em] w-[2.5px] translate-y-[0.12em] rounded-sm bg-aurora-1 [animation:blink_1.1s_step-end_infinite]"
            />
          )}
        </p>
      </div>

      <button
        onClick={() => (armed ? trigger() : void listen())}
        aria-label={armed ? 'Travou — pedir ajuda agora' : 'Ativar a escuta'}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-7 text-center"
      >
        <span className="label-caps">
          {expectedKind === 'word'
            ? 'a palavra'
            : expectedKind === 'cue'
              ? 'o degrau'
              : 'esperando a palavra'}
        </span>

        <span
          key={flash?.id ?? (resolved ? 'resolved' : 'waiting')}
          className={[
            'voice mt-4 max-w-[11ch] text-[46px] leading-[1.02]',
            expectedKind === 'word'
              ? 'animate-reveal text-brand'
              : expectedKind === 'cue'
                ? 'animate-rise text-fg'
                : 'text-faint'
          ].join(' ')}
        >
          {expected}
        </span>

        {flash?.source && (
          <span className="mt-4 max-w-[32ch] text-[0.82rem] leading-snug text-faint">
            {flash.source}
          </span>
        )}

        {resolved && (
          <span className="mt-4 max-w-[30ch] text-[0.95rem] leading-snug text-dim">
            Em {resolvedAt} {resolvedAt === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa
            mais longe.
          </span>
        )}

        {!flash && !resolved && (
          <span className="mt-4 max-w-[30ch] text-[0.95rem] leading-snug text-faint">
            {armed
              ? 'Toque quando ela não vier.'
              : 'Toque para eu começar a acompanhar. Nada é gravado em disco.'}
          </span>
        )}
      </button>

      <div className="relative z-10 px-6">
        <LearningCard />
      </div>

      {open && ladder.length > 0 && (
        <div className="relative z-10 mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
          {ladder.map(step => (
            <i
              key={step.level}
              className={[
                'block h-1 rounded-sm transition-all',
                step.level <= level ? 'w-6 bg-brand' : 'w-3 bg-line'
              ].join(' ')}
            />
          ))}
        </div>
      )}

      {open && !resolved && (
        <div className="relative z-10 mt-3 flex justify-center">
          <button onClick={handleSuccess} className="text-sm font-semibold text-fg">
            Consegui
          </button>
        </div>
      )}

      <div className="shrink-0 pb-[92px]" />
    </section>
  )
}
