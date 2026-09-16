import type { ChannelState, DiscretionMode } from '@/domain/types'

export const PATTERNS = {
  confirm: [40],
  level1: [60],
  level2: [60, 80, 60],
  level3: [60, 80, 60, 80, 60],
  levelFinal: [220],
  success: [30, 40, 30, 40, 120]
} as const

export type PatternName = keyof typeof PATTERNS

export const canVibrate =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

export function patternFor(level: number, isFinal: boolean): PatternName {
  if (isFinal) return 'levelFinal'
  if (level >= 3) return 'level3'
  if (level === 2) return 'level2'
  return 'level1'
}

export function pulse(
  pattern: readonly number[],
  channels: ChannelState,
  intensity: number,
  soft = false
): boolean {
  if (!channels.phone) return false
  if (!canVibrate) return false
  const scale = soft ? 0.34 + intensity * 0.14 : 0.5 + intensity * 0.2
  const scaled = pattern.map((ms, i) => (i % 2 === 0 ? Math.max(12, Math.round(ms * scale)) : ms))
  try {
    navigator.vibrate(scaled)
    return true
  } catch {
    return false
  }
}

export function vibrate(name: PatternName, channels: ChannelState, intensity: number): boolean {
  return pulse(PATTERNS[name], channels, intensity)
}

let voice: SpeechSynthesisVoice | null = null

function loadVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices()
  voice =
    voices.find(v => /pt[-_]BR/i.test(v.lang)) ?? voices.find(v => /^pt/i.test(v.lang)) ?? null
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoice()
  speechSynthesis.addEventListener('voiceschanged', loadVoice)
}

export function canSpeak(channels: ChannelState, discretion: DiscretionMode): boolean {
  if (!channels.earbuds && discretion !== 'home') return false
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function utteranceFor(text: string, discretion: DiscretionMode): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  if (voice) utterance.voice = voice
  utterance.lang = 'pt-BR'
  utterance.rate = 0.88
  utterance.pitch = 0.95
  utterance.volume = discretion === 'home' ? 1 : 0.85
  return utterance
}

export function speak(text: string, channels: ChannelState, discretion: DiscretionMode) {
  if (!canSpeak(channels, discretion)) return
  try {
    speechSynthesis.cancel()
    speechSynthesis.speak(utteranceFor(text, discretion))
  } catch {
    return
  }
}

export type WatchOutcome =
  | 'sent-worker'
  | 'sent-page'
  | 'channel-off'
  | 'unsupported'
  | 'denied'
  | 'failed'

const WATCH_VIBRATION = [60, 80, 60]

export async function notifyWatch(
  title: string,
  body: string,
  channels: ChannelState
): Promise<WatchOutcome> {
  if (!channels.watch) return 'channel-off'
  if (!('Notification' in window)) return 'unsupported'

  if (Notification.permission !== 'granted') {
    const granted = await Notification.requestPermission().catch(() => 'denied')
    if (granted !== 'granted') return 'denied'
  }

  const options: NotificationOptions = {
    body,
    tag: 'cue',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    silent: false,
    ...({ renotify: true, vibrate: WATCH_VIBRATION } as Record<string, unknown>)
  }

  try {
    const registration = await navigator.serviceWorker?.ready
    if (registration) {
      await registration.showNotification(title, options)
      return 'sent-worker'
    }
  } catch {
    return 'failed'
  }

  try {
    new Notification(title, options)
    return 'sent-page'
  } catch {
    return 'failed'
  }
}

let unlocked = false

export function unlockAudio() {
  if (unlocked || !('speechSynthesis' in window)) return
  try {
    const silent = new SpeechSynthesisUtterance('')
    silent.volume = 0
    speechSynthesis.speak(silent)
    unlocked = true
  } catch {
    return
  }
}
