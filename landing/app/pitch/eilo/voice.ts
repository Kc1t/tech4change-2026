import { useState, useSyncExternalStore } from 'react'

export const SPEAK_URL = '/pitch/api/speak'

export type VoiceMode = 'on' | 'off'

export type Voice = {
  unlock: () => void
  prefetch: (text: string) => void
  say: (text: string) => Promise<void>
  stop: () => void
  speaking: () => boolean
  mode: () => VoiceMode
  setMode: (mode: VoiceMode) => void
  subscribe: (listener: () => void) => () => void
}

const CLIP_VERSION = 'gia-3'
const FETCH_TIMEOUT_MS = 7000
const MAX_PLAY_MS = 7000
const MODE_KEY = 'eilo-pitch-voice'
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

function spoken(text: string): string {
  return text.replace(/…|\.{3}/g, '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

function storedMode(): VoiceMode {
  try {
    return window.localStorage.getItem(MODE_KEY) === 'off' ? 'off' : 'on'
  } catch {
    return 'on'
  }
}

export function nextVoiceMode(mode: VoiceMode): VoiceMode {
  return mode === 'on' ? 'off' : 'on'
}

export const VOICE_MODE_LABEL: Record<VoiceMode, string> = {
  on: 'voz ligada',
  off: 'sem voz'
}

export function createVoice(): Voice {
  const clips = new Map<string, Promise<string | null>>()
  const listeners = new Set<() => void>()
  let mode: VoiceMode = storedMode()
  let audio: HTMLAudioElement | null = null
  let finish: (() => void) | null = null
  let active = false
  let unlocked = false
  let token = 0

  const notify = () => listeners.forEach(listener => listener())
  const setActive = (value: boolean) => {
    if (active === value) return
    active = value
    notify()
  }

  const element = () => {
    audio ??= new Audio()
    audio.preload = 'auto'
    return audio
  }

  const clip = (text: string): Promise<string | null> => {
    const cached = clips.get(text)
    if (cached) return cached
    const pending = fetch(`${SPEAK_URL}?text=${encodeURIComponent(text)}&version=${CLIP_VERSION}`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
      .then(async response => {
        const type = response.headers.get('content-type') ?? ''
        if (!response.ok || !type.startsWith('audio/')) return null
        return URL.createObjectURL(await response.blob())
      })
      .catch(() => null)
      .then(url => {
        if (!url) clips.delete(text)
        return url
      })
    clips.set(text, pending)
    return pending
  }

  const onDevice = (text: string, done: () => void) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return done()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 1
    utterance.onend = done
    utterance.onerror = done
    synth.cancel()
    synth.speak(utterance)
  }

  const stop = () => {
    token += 1
    const end = finish
    finish = null
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
    }
    try {
      window.speechSynthesis?.cancel()
    } catch {}
    end?.()
    setActive(false)
  }

  return {
    unlock() {
      if (unlocked || active) return
      unlocked = true
      const el = element()
      el.muted = true
      el.src = SILENT_WAV
      void el.play().then(() => el.pause()).catch(() => {}).finally(() => {
        el.muted = false
      })
    },
    prefetch(raw) {
      const text = spoken(raw)
      if (text && mode !== 'off') void clip(text)
    },
    say(raw) {
      const text = spoken(raw)
      if (!text || mode === 'off') return Promise.resolve()
      stop()
      const mine = ++token
      return new Promise<void>(resolve => {
        let guard = 0
        function done() {
          window.clearTimeout(guard)
          if (finish === done) finish = null
          if (mine === token) setActive(false)
          resolve()
        }
        finish = done
        void clip(text).then(url => {
          if (mine !== token) return
          setActive(true)
          guard = window.setTimeout(done, MAX_PLAY_MS)
          if (!url) return onDevice(text, done)
          const el = element()
          el.onended = done
          el.onerror = () => onDevice(text, done)
          el.muted = false
          el.volume = 1
          el.src = url
          el.play().catch(() => onDevice(text, done))
        })
      })
    },
    stop,
    speaking: () => active,
    mode: () => mode,
    setMode(next) {
      mode = next
      try {
        window.localStorage.setItem(MODE_KEY, next)
      } catch {}
      if (next === 'off') stop()
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}

const noop = () => () => {}

export function useVoice() {
  const [voice] = useState<Voice | null>(() => (typeof window === 'undefined' ? null : createVoice()))
  const subscribe = voice ? voice.subscribe : noop
  const mode = useSyncExternalStore(subscribe, () => voice?.mode() ?? 'on', () => 'on' as VoiceMode)
  const speaking = useSyncExternalStore(subscribe, () => voice?.speaking() ?? false, () => false)
  return { voice, mode, speaking }
}
