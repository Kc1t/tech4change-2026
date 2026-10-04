'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppHome } from '../app-home/home'
import { nextVoiceMode, useVoice, VOICE_MODE_LABEL } from '../eilo/voice'
import type { DemoCue } from '../demo/types'
import { useLiveDemo } from '../demo/use-live-demo'
import { publish, vibrationPattern } from '../sync'
import { PhoneControls } from './phone-controls'
import { useDeckGate } from './use-deck-gate'

type Link = 'pitch' | 'alone' | 'offline' | 'paused'

const LINK_LABEL: Record<Link, string> = {
  pitch: 'conectado ao pitch',
  alone: 'tela do pitch fechada',
  offline: 'sem internet',
  paused: 'em pausa até o slide da demo'
}

const LOUD_RMS = 0.1
const FRESH_START_MS = 20_000

function LiveStatus({ link, listening, level }: { link: Link; listening: boolean; level: () => number }) {
  const meter = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!listening) return
    let frame = 0
    let smooth = 0
    const loop = () => {
      smooth = smooth * 0.7 + Math.min(1, level() / LOUD_RMS) * 0.3
      meter.current?.style.setProperty('--lvl', smooth.toFixed(3))
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [level, listening])

  return (
    <div className={`phone-page__status phone-page__status--${link}`} role="status">
      <i />
      <span>{LINK_LABEL[link]}</span>
      {listening && (
        <span ref={meter} className="phone-page__meter" aria-label="nível do microfone">
          <b />
          <b />
          <b />
          <b />
        </span>
      )}
    </div>
  )
}

function enterFullscreen() {
  const root = document.documentElement
  if (!root.requestFullscreen || document.fullscreenElement) return
  root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
}

type WakeLock = { release: () => Promise<void> }
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLock> } }

function useScreenAwake(on: boolean) {
  useEffect(() => {
    if (!on) return
    const nav = navigator as WakeLockNavigator
    if (!nav.wakeLock) return
    let lock: WakeLock | null = null
    let disposed = false
    const acquire = () => {
      if (disposed || document.visibilityState !== 'visible') return
      nav.wakeLock?.request('screen').then(
        granted => {
          if (disposed) void granted.release().catch(() => {})
          else lock = granted
        },
        () => {}
      )
    }
    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', acquire)
      void lock?.release().catch(() => {})
    }
  }, [on])
}

export function PhoneDemo() {
  const [armed, setArmed] = useState(false)
  const [link, setLink] = useState<Link>('alone')
  const [controlsOpen, setControlsOpen] = useState(false)
  const { voice, mode } = useVoice()
  const buzzedRef = useRef('')

  const onCue = useCallback((cue: DemoCue) => {
    const key = `${cue.phase}-${cue.level}`
    if (cue.phase === 'idle' || key === buzzedRef.current) {
      if (cue.phase === 'idle') buzzedRef.current = ''
      return
    }
    buzzedRef.current = key
    const pattern = vibrationPattern(cue)
    if (pattern.length && 'vibrate' in navigator) navigator.vibrate(pattern)
  }, [])

  const gate = useDeckGate()
  const listening = armed && gate.open
  const { state, reset, micLevel, nextLevel, giveWord, wake } = useLiveDemo(listening, onCue, { voice, wakeWord: true })
  const mic = listening ? state.mic : 'off'
  const activity = listening ? state.activity : 'off'
  const latest = useRef({ state, mic, activity })
  const pausedAt = useRef<number | null>(null)
  useEffect(() => {
    latest.current = { state, mic, activity }
  }, [state, mic, activity])
  useScreenAwake(armed)

  useEffect(() => {
    if (!armed) return
    if (!gate.open) {
      pausedAt.current ??= Date.now()
      return
    }
    const pausedFor = pausedAt.current === null ? 0 : Date.now() - pausedAt.current
    pausedAt.current = null
    if (pausedFor < FRESH_START_MS) return
    buzzedRef.current = ''
    reset()
  }, [armed, gate.open, reset])

  const track = useCallback((sent: Promise<number | null>) => {
    void sent.then(listeners => setLink(listeners === null ? 'offline' : listeners > 0 ? 'pitch' : 'alone'))
  }, [])

  useEffect(() => {
    if (!armed) return
    track(publish({ cue: state.cue, words: state.words, mic, activity, at: Date.now() }))
  }, [armed, state.cue, state.words, mic, activity, track])

  useEffect(() => {
    if (!armed) return
    const beat = window.setInterval(() => {
      const { state: s, mic: m, activity: a } = latest.current
      track(publish({ cue: s.cue, words: s.words, mic: m, activity: a, at: Date.now() }))
    }, 3000)
    return () => window.clearInterval(beat)
  }, [armed, track])

  const denied = listening && (state.mic === 'blocked' || state.mic === 'unsupported')
  const insecure = typeof window !== 'undefined' && !window.isSecureContext

  return (
    <div className="phone-page">
      <AppHome cue={state.cue} heard={state.words.join(' ')} mic={mic} activity={listening ? state.activity : undefined} />
      {armed && (
        <LiveStatus
          link={state.network === 'offline' ? 'offline' : gate.paused ? 'paused' : link}
          listening={listening && state.mic === 'listening' && state.ear === 'openrouter'}
          level={micLevel}
        />
      )}
      {denied && (
        <div className="phone-page__alert">
          <b>{state.mic === 'blocked' ? 'O microfone está bloqueado' : 'Este navegador não ouve'}</b>
          <span>
            {insecure
              ? 'Abra o link com https:// para o navegador liberar o microfone.'
              : 'Toque no cadeado ao lado do endereço, libere o microfone e tente de novo.'}
          </span>
          <button
            onClick={() => {
              setArmed(false)
              window.setTimeout(() => setArmed(true), 50)
            }}
          >
            tentar de novo
          </button>
        </div>
      )}
      {armed && (
        <div className="phone-page__tools">
          <button
            aria-pressed={mode !== 'off'}
            onClick={() => {
              voice?.unlock()
              voice?.setMode(nextVoiceMode(mode))
            }}
          >
            {VOICE_MODE_LABEL[mode]}
          </button>
          <button
            onClick={() => {
              buzzedRef.current = ''
              reset()
            }}
          >
            recomeçar
          </button>
          <button aria-pressed={controlsOpen} onClick={() => setControlsOpen(open => !open)}>
            controles
          </button>
        </div>
      )}
      {armed && controlsOpen && (
        <PhoneControls
          state={state}
          paused={gate.paused}
          controls={{
            wake: () => wake(),
            nextLevel,
            giveWord,
            reset: () => {
              buzzedRef.current = ''
              reset()
            }
          }}
          onClose={() => setControlsOpen(false)}
        />
      )}
      {!armed && (
        <button
          className="phone-page__start"
          onClick={() => {
            voice?.unlock()
            enterFullscreen()
            if ('vibrate' in navigator) navigator.vibrate(40)
            setArmed(true)
          }}
        >
          <b>Começar</b>
          <span>Diga “Olá, Eilo” para começar. Ele ouve, dá as dicas e vibra; se a palavra não vier, ele fala. A tela do pitch acompanha.</span>
        </button>
      )}
    </div>
  )
}
