import { createAudioPlayer } from 'expo-audio'
import * as Speech from 'expo-speech'
import { apiBase } from './sync/client'
import { useApp } from './store'
import type { VoiceChoice } from './domain/comfort'

const PREFETCH_TIMEOUT_MS = 6000
const PREVIEW_TIMEOUT_MS = 8000

const ready = new Set<string>()
const pending = new Set<string>()
let finishCurrent: (() => void) | null = null

function spoken(text: string): string {
  return text.replace(/…/g, '').trim()
}

function voiceUrl(text: string, voice: VoiceChoice): string {
  return `${apiBase()}/v1/tts?voice=${voice}&text=${encodeURIComponent(text)}`
}

function currentVoice(): VoiceChoice {
  return useApp.getState().voice
}

async function warm(text: string, voice: VoiceChoice, timeoutMs: number): Promise<boolean> {
  const key = `${voice}:${text}`
  if (ready.has(key)) return true

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(voiceUrl(text, voice), { signal: controller.signal })
    if (response.ok) ready.add(key)
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function prefetchVoice(texts: string[]) {
  const voice = currentVoice()
  for (const raw of texts) {
    const text = spoken(raw)
    const key = `${voice}:${text}`
    if (!text || ready.has(key) || pending.has(key)) continue
    pending.add(key)
    void warm(text, voice, PREFETCH_TIMEOUT_MS).finally(() => pending.delete(key))
  }
}

export function stopVoice() {
  const finish = finishCurrent
  finishCurrent = null
  finish?.()
  void Speech.stop()
}

function play(text: string, voice: VoiceChoice, onDone: () => void) {
  const player = createAudioPlayer(voiceUrl(text, voice))
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    if (finishCurrent === finish) finishCurrent = null
    player.remove()
    onDone()
  }
  finishCurrent = finish

  player.addListener('playbackStatusUpdate', status => {
    if (status.didJustFinish) finish()
  })
  player.play()
}

function speakOnDevice(text: string, onDone: () => void) {
  Speech.speak(text, { language: 'pt-BR', rate: 0.9, onDone, onStopped: onDone, onError: onDone })
}

export function speakVoice(raw: string, onDone: () => void) {
  const text = spoken(raw)
  const voice = currentVoice()
  stopVoice()

  if (ready.has(`${voice}:${text}`)) play(text, voice, onDone)
  else speakOnDevice(text, onDone)
}

export async function previewVoice(voice: VoiceChoice, raw: string, onDone: () => void) {
  const text = spoken(raw)
  stopVoice()
  const available = await warm(text, voice, PREVIEW_TIMEOUT_MS)
  if (available) play(text, voice, onDone)
  else speakOnDevice(text, onDone)
}
