'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { startCloudTranscriber, type Transcriber } from '@/api/stt'

const CALIBRATION_MS = 900
const FLOOR_PERCENTILE = 0.6
const ON_RATIO = 2.6
const OFF_RATIO = 1.5
const ON_MINIMUM = 0.018
const OFF_MINIMUM = 0.01
const NOISY_FLOOR = 0.06
const DRIFT = 0.01
const MIN_SPEECH_MS = 700
const BLOCK_SILENCE_MS = 1300

interface RecognitionResult {
  isFinal: boolean
  0: { transcript: string }
}

interface RecognitionEvent {
  resultIndex: number
  results: { length: number; [index: number]: RecognitionResult }
}

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type RecognitionFactory = new () => Recognition

function recognitionFactory(): RecognitionFactory | null {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionFactory
    webkitSpeechRecognition?: RecognitionFactory
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))
  return sorted[index]!
}

export interface ListeningState {
  active: boolean
  denied: boolean
  calibrating: boolean
  noisy: boolean
  speaking: boolean
  transcribing: boolean
  engine: 'cloud' | 'browser' | null
  transcript: string
}

const IDLE: ListeningState = {
  active: false,
  denied: false,
  calibrating: false,
  noisy: false,
  speaking: false,
  transcribing: false,
  engine: null,
  transcript: ''
}

export function useListening(onBlock: (transcript: string) => void, keyterms: string[] = []) {
  const levelRef = useRef(0)
  const [state, setState] = useState<ListeningState>(IDLE)

  const blockHandler = useRef(onBlock)
  blockHandler.current = onBlock
  const keytermsRef = useRef(keyterms)
  useEffect(() => {
    keytermsRef.current = keyterms
  }, [keyterms])

  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const frameRef = useRef(0)
  const recognitionRef = useRef<Recognition | null>(null)
  const transcriberRef = useRef<Transcriber | null>(null)
  const transcriptRef = useRef('')

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    transcriberRef.current?.stop()
    transcriberRef.current = null
    recognitionRef.current?.stop()
    recognitionRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    void contextRef.current?.close()
    contextRef.current = null
    levelRef.current = 0
    transcriptRef.current = ''
    setState(IDLE)
  }, [])

  const start = useCallback(async () => {
    if (streamRef.current) return

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setState({ ...IDLE, denied: true })
      return
    }

    streamRef.current = stream
    const context = new AudioContext()
    contextRef.current = context
    const analyser = context.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.7
    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)

    const samples = new Float32Array(analyser.fftSize)
    const calibration: number[] = []
    const calibrationEndsAt = performance.now() + CALIBRATION_MS

    let floor = 0
    let speechOn = ON_MINIMUM
    let speechOff = OFF_MINIMUM
    let calibrated = false
    let speaking = false
    let speechStartedAt = 0
    let silenceStartedAt = 0

    function applyFloor(next: number) {
      floor = next
      speechOn = Math.max(ON_MINIMUM, floor * ON_RATIO)
      speechOff = Math.max(OFF_MINIMUM, floor * OFF_RATIO)
    }

    setState({ ...IDLE, active: true, calibrating: true })

    function tick() {
      analyser.getFloatTimeDomainData(samples)

      let sum = 0
      for (const sample of samples) sum += sample * sample
      const rms = Math.sqrt(sum / samples.length)

      const now = performance.now()

      if (!calibrated) {
        calibration.push(rms)
        if (now >= calibrationEndsAt) {
          applyFloor(percentile(calibration, FLOOR_PERCENTILE))
          calibrated = true
          setState(previous => ({
            ...previous,
            calibrating: false,
            noisy: floor > NOISY_FLOOR
          }))
        }
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      const span = Math.max(0.001, speechOn * 2.5 - floor)
      levelRef.current = Math.max(0, Math.min(1, (rms - floor) / span))

      if (!speaking && rms > speechOn) {
        speaking = true
        speechStartedAt = now
        silenceStartedAt = 0
        setState(previous => ({ ...previous, speaking: true }))
      } else if (speaking && rms < speechOff) {
        if (silenceStartedAt === 0) silenceStartedAt = now

        const spoke = silenceStartedAt - speechStartedAt >= MIN_SPEECH_MS
        const paused = now - silenceStartedAt >= BLOCK_SILENCE_MS

        if (paused) {
          speaking = false
          silenceStartedAt = 0
          setState(previous => ({ ...previous, speaking: false }))
          if (spoke) blockHandler.current(transcriptRef.current)
        }
      } else if (speaking && rms > speechOn) {
        silenceStartedAt = 0
      }

      if (!speaking && rms < speechOn) {
        const drifted = floor * (1 - DRIFT) + rms * DRIFT
        if (Math.abs(drifted - floor) > 0.00005) {
          applyFloor(drifted)
          const noisy = floor > NOISY_FLOOR
          setState(previous => (previous.noisy === noisy ? previous : { ...previous, noisy }))
        }
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    function showTranscript(text: string) {
      transcriptRef.current = text
      setState(previous => ({ ...previous, transcript: text }))
    }

    function startBrowserRecognition() {
      const Factory = recognitionFactory()
      if (!Factory) return

      try {
        const recognition = new Factory()
        recognition.lang = 'pt-BR'
        recognition.continuous = true
        recognition.interimResults = true
        recognition.onresult = event => {
          let text = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i]![0].transcript
          }
          showTranscript(text.trim().slice(-160))
        }
        recognition.onerror = () => setState(previous => ({ ...previous, transcribing: false }))
        recognition.onend = () => {
          if (recognitionRef.current) recognition.start()
        }
        recognition.start()
        recognitionRef.current = recognition
        setState(previous => ({ ...previous, transcribing: true, engine: 'browser' }))
      } catch {
        recognitionRef.current = null
      }
    }

    const cloud = await startCloudTranscriber({
      context,
      source,
      keyterms: keytermsRef.current,
      onText: showTranscript,
      onLost: () => {
        transcriberRef.current = null
        if (streamRef.current === stream) startBrowserRecognition()
      }
    })

    if (streamRef.current !== stream) {
      cloud?.stop()
      return
    }

    if (cloud) {
      transcriberRef.current = cloud
      setState(previous => ({ ...previous, transcribing: true, engine: 'cloud' }))
      return
    }

    startBrowserRecognition()
  }, [])

  useEffect(() => stop, [stop])

  return { levelRef, state, start, stop }
}
