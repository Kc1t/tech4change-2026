import { canSpeak, pulse, utteranceFor } from './index'
import { stressOf } from '@/domain/haptics'
import { syllables } from '@/domain/phonology'
import type { ChannelState, DiscretionMode } from '@/domain/types'

const WORD = /[\p{L}\p{M}]+/gu
const ACCENT = /[áéíóúâêôàãõ]/i
const WORD_GAP = 0.35
const DEFAULT_SYLLABLE_MS = 205
const MIN_SYLLABLE_MS = 95
const MAX_SYLLABLE_MS = 460
const START_WATCHDOG_MS = 420
const FIRST_WORD_GRACE_MS = 240

let syllableMs = DEFAULT_SYLLABLE_MS

export interface SpokenWord {
  charIndex: number
  syllables: string[]
  stress: number
}

export interface Mark {
  word: number
  syllable: number
}

interface Beat {
  position: number
  stressed: boolean
  charIndex: number
  word: number
  syllable: number
  onset: boolean
}

export function planSpeech(text: string): SpokenWord[] {
  const words: SpokenWord[] = []
  for (const match of text.matchAll(WORD)) {
    const parts = syllables(match[0])
    if (parts.length === 0 || match.index === undefined) continue
    words.push({ charIndex: match.index, syllables: parts, stress: stressOf(parts) })
  }
  return words
}

function beatsOf(words: SpokenWord[]): Beat[] {
  const beats: Beat[] = []
  let position = 0

  words.forEach((word, wordIndex) => {
    if (wordIndex > 0) position += WORD_GAP
    const weak =
      words.length > 1 && word.syllables.length === 1 && !ACCENT.test(word.syllables[0]!)

    word.syllables.forEach((_, index) => {
      beats.push({
        position,
        stressed: !weak && index === word.stress,
        charIndex: word.charIndex,
        word: wordIndex,
        syllable: index,
        onset: index === 0
      })
      position += 1
    })
  })

  return beats
}

function beatMs(beat: Beat, period: number): number {
  return beat.stressed
    ? Math.min(138, Math.round(period * 0.62))
    : Math.min(58, Math.round(period * 0.26))
}

function usable(measured: number): boolean {
  return measured >= MIN_SYLLABLE_MS && measured <= MAX_SYLLABLE_MS
}

let timer: number | null = null
let watchdog: number | null = null
let listener: ((mark: Mark | null) => void) | null = null

function release() {
  if (!listener) return
  const current = listener
  listener = null
  current(null)
}

export function stopEntrainment() {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
  if (watchdog !== null) {
    window.clearTimeout(watchdog)
    watchdog = null
  }
  release()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.cancel()
}

export function speakEntrained(
  text: string,
  channels: ChannelState,
  discretion: DiscretionMode,
  intensity: number,
  onBeat?: (mark: Mark | null) => void
): boolean {
  if (!canSpeak(channels, discretion)) return false

  const words = planSpeech(text)
  if (words.length === 0) return false

  const beats = beatsOf(words)
  stopEntrainment()
  listener = onBeat ?? null

  let period = syllableMs
  let anchor = 0
  let started = false
  let index = 0
  let limit = beats.filter(beat => beat.word === 0).length
  let anchored = false

  function schedule() {
    if (index >= limit) return
    const due = anchor + beats[index]!.position * period
    timer = window.setTimeout(fire, Math.max(0, due - performance.now()))
  }

  function fire() {
    const beat = beats[index]
    if (!beat) return
    pulse([beatMs(beat, period)], channels, intensity, true)
    listener?.({ word: beat.word, syllable: beat.syllable })
    index += 1
    if (index >= limit && !anchored) limit = beats.length
    schedule()
  }

  function begin() {
    if (started) return
    started = true
    anchor = performance.now()
    timer = window.setTimeout(() => {
      if (anchored) return
      anchor = performance.now()
      schedule()
    }, FIRST_WORD_GRACE_MS)
  }

  try {
    const utterance = utteranceFor(text, discretion)

    utterance.onstart = begin
    utterance.onerror = begin

    utterance.onboundary = event => {
      if (event.name && event.name !== 'word') return
      if (!started) return

      const next = beats.findIndex(beat => beat.onset && beat.charIndex === event.charIndex)
      if (next < 0) return
      if (next < index && beats[index - 1]?.word !== beats[next]!.word) return

      const now = performance.now()
      const position = beats[next]!.position
      if (position > 0) {
        const measured = (now - anchor) / position
        if (usable(measured)) period = measured
      }

      anchored = true
      anchor = now - position * period
      index = Math.max(index, next)
      limit = next + beats.filter(beat => beat.word === beats[next]!.word).length

      if (timer !== null) window.clearTimeout(timer)
      schedule()
    }

    utterance.onend = () => {
      if (usable(period)) syllableMs = Math.round(syllableMs * 0.5 + period * 0.5)
      if (timer !== null) window.clearTimeout(timer)
      timer = null
      release()
    }

    speechSynthesis.speak(utterance)
    watchdog = window.setTimeout(begin, START_WATCHDOG_MS)
    return true
  } catch {
    stopEntrainment()
    return false
  }
}

export function syllablePeriod(): number {
  return syllableMs
}
