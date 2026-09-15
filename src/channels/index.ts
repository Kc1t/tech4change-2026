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

export function vibrate(name: PatternName, channels: ChannelState, intensity: number): boolean {
  if (!channels.phone) return false
  const scale = 0.5 + intensity * 0.2
  const pattern = PATTERNS[name].map((ms, i) => (i % 2 === 0 ? Math.round(ms * scale) : ms))
  if (!canVibrate) return false
  try {
    navigator.vibrate(pattern)
    return true
  } catch {
    return false
  }
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

export function speak(text: string, channels: ChannelState, discretion: DiscretionMode) {
  if (!channels.earbuds && discretion !== 'home') return
  if (!('speechSynthesis' in window)) return
  try {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (voice) utterance.voice = voice
    utterance.lang = 'pt-BR'
    utterance.rate = 0.88
    utterance.pitch = 0.95
    utterance.volume = discretion === 'home' ? 1 : 0.85
    speechSynthesis.speak(utterance)
  } catch {
    return
  }
}

export async function notifyWatch(
  title: string,
  body: string,
  channels: ChannelState
): Promise<boolean> {
  if (!channels.watch) return false
  if (!('Notification' in window)) return false
  try {
    if (Notification.permission !== 'granted') {
      const granted = await Notification.requestPermission()
      if (granted !== 'granted') return false
    }
    new Notification(title, { body, tag: 'cue' })
    return true
  } catch {
    return false
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
