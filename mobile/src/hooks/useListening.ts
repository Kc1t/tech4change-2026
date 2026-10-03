import { useCallback, useEffect, useRef, useState } from 'react'
import { Linking } from 'react-native'
import { useAudioRecorder } from '@siteed/audio-studio'
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio'
import { startTranscriber, type Transcriber } from '../api/stt'

const CHUNK_MS = 80
const CALIBRATION_MS = 900
const FLOOR_PERCENTILE = 0.6
const ON_RATIO = 2.6
const OFF_RATIO = 1.5
const ON_MINIMUM = 0.018
const OFF_MINIMUM = 0.01
const NOISY_FLOOR = 0.06
const DRIFT = 0.04
const MIN_SPEECH_MS = 700
const BLOCK_SILENCE_MS = 1300

export type TranscriptionEngine = 'connecting' | 'cloud' | 'lost'

export interface ListeningState {
  active: boolean
  denied: boolean
  canAskAgain: boolean
  calibrating: boolean
  noisy: boolean
  speaking: boolean
  engine: TranscriptionEngine | null
  transcript: string
}

const IDLE: ListeningState = {
  active: false,
  denied: false,
  canAskAgain: true,
  calibrating: false,
  noisy: false,
  speaking: false,
  engine: null,
  transcript: ''
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))
  return sorted[index]!
}

function rootMeanSquare(samples: Float32Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i]! * samples[i]!
  return samples.length === 0 ? 0 : Math.sqrt(sum / samples.length)
}

interface Meter {
  calibration: number[]
  calibrationEndsAt: number
  calibrated: boolean
  floor: number
  speechOn: number
  speechOff: number
  speaking: boolean
  speechStartedAt: number
  silenceStartedAt: number
}

function freshMeter(now: number): Meter {
  return {
    calibration: [],
    calibrationEndsAt: now + CALIBRATION_MS,
    calibrated: false,
    floor: 0,
    speechOn: ON_MINIMUM,
    speechOff: OFF_MINIMUM,
    speaking: false,
    speechStartedAt: 0,
    silenceStartedAt: 0
  }
}

export function useListening(
  onBlock: () => void,
  keyterms: string[] = [],
  silenceMs = BLOCK_SILENCE_MS
) {
  const { startRecording, stopRecording } = useAudioRecorder()
  const [state, setState] = useState<ListeningState>(IDLE)

  const levelRef = useRef(0)
  const deafRef = useRef(false)
  const recordingRef = useRef(false)
  const meterRef = useRef<Meter>(freshMeter(0))
  const transcriberRef = useRef<Transcriber | null>(null)

  const blockHandler = useRef(onBlock)
  const keytermsRef = useRef(keyterms)
  const silenceRef = useRef(silenceMs)
  useEffect(() => {
    blockHandler.current = onBlock
    keytermsRef.current = keyterms
    silenceRef.current = silenceMs
  }, [onBlock, keyterms, silenceMs])

  const teardown = useCallback(() => {
    transcriberRef.current?.stop()
    transcriberRef.current = null
    levelRef.current = 0
    deafRef.current = false
  }, [])

  const stop = useCallback(() => {
    teardown()
    if (recordingRef.current) {
      recordingRef.current = false
      void stopRecording().catch(() => undefined)
    }
    setState(IDLE)
  }, [stopRecording, teardown])

  const setDeaf = useCallback((deaf: boolean) => {
    deafRef.current = deaf
    if (deaf) return
    const meter = meterRef.current
    meter.speaking = false
    meter.silenceStartedAt = 0
    levelRef.current = 0
    setState(previous => (previous.speaking ? { ...previous, speaking: false } : previous))
  }, [])

  const measure = useCallback((rms: number) => {
    const meter = meterRef.current
    const now = Date.now()

    function applyFloor(next: number) {
      meter.floor = next
      meter.speechOn = Math.max(ON_MINIMUM, next * ON_RATIO)
      meter.speechOff = Math.max(OFF_MINIMUM, next * OFF_RATIO)
    }

    if (!meter.calibrated) {
      meter.calibration.push(rms)
      if (now >= meter.calibrationEndsAt) {
        applyFloor(percentile(meter.calibration, FLOOR_PERCENTILE))
        meter.calibrated = true
        setState(previous => ({
          ...previous,
          calibrating: false,
          noisy: meter.floor > NOISY_FLOOR
        }))
      }
      return
    }

    if (deafRef.current) return

    const span = Math.max(0.001, meter.speechOn * 2.5 - meter.floor)
    levelRef.current = Math.max(0, Math.min(1, (rms - meter.floor) / span))

    if (!meter.speaking && rms > meter.speechOn) {
      meter.speaking = true
      meter.speechStartedAt = now
      meter.silenceStartedAt = 0
      setState(previous => ({ ...previous, speaking: true }))
    } else if (meter.speaking && rms < meter.speechOff) {
      if (meter.silenceStartedAt === 0) meter.silenceStartedAt = now

      const spoke = meter.silenceStartedAt - meter.speechStartedAt >= MIN_SPEECH_MS
      const paused = now - meter.silenceStartedAt >= silenceRef.current

      if (paused) {
        meter.speaking = false
        meter.silenceStartedAt = 0
        setState(previous => ({ ...previous, speaking: false }))
        if (spoke) blockHandler.current()
      }
    } else if (meter.speaking && rms > meter.speechOn) {
      meter.silenceStartedAt = 0
    }

    if (!meter.speaking && rms < meter.speechOn) {
      const drifted = meter.floor * (1 - DRIFT) + rms * DRIFT
      if (Math.abs(drifted - meter.floor) > 0.00005) {
        applyFloor(drifted)
        const noisy = meter.floor > NOISY_FLOOR
        setState(previous => (previous.noisy === noisy ? previous : { ...previous, noisy }))
      }
    }
  }, [])

  const start = useCallback(async () => {
    if (recordingRef.current) return

    const permission = await requestRecordingPermissionsAsync()
    if (!permission.granted) {
      setState({ ...IDLE, denied: true, canAskAgain: permission.canAskAgain })
      return
    }

    recordingRef.current = true
    meterRef.current = freshMeter(Date.now())
    setState({ ...IDLE, active: true, calibrating: true, engine: 'connecting' })

    try {
      await startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_32bit',
        streamFormat: 'float32',
        interval: CHUNK_MS,
        keepFullAnalysis: false,
        output: { primary: { enabled: false } },
        android: { audioFocusStrategy: 'none' },
        onAudioStream: async event => {
          const samples = event.data as Float32Array
          if (!deafRef.current) transcriberRef.current?.send(samples)
          measure(rootMeanSquare(samples))
        }
      })
    } catch {
      await stopRecording().catch(() => undefined)
      recordingRef.current = false
      setState(IDLE)
      return
    }

    if (!recordingRef.current) {
      await stopRecording().catch(() => undefined)
      return
    }

    const transcriber = await startTranscriber({
      keyterms: keytermsRef.current,
      onText: transcript => setState(previous => ({ ...previous, transcript })),
      onLost: () => {
        transcriberRef.current = null
        setState(previous => ({ ...previous, engine: 'lost' }))
      }
    })

    if (!recordingRef.current) {
      transcriber?.stop()
      return
    }

    transcriberRef.current = transcriber
    setState(previous => ({ ...previous, engine: transcriber ? 'cloud' : 'lost' }))
  }, [measure, startRecording, stopRecording])

  const enableMicrophone = useCallback(async () => {
    const permission = await getRecordingPermissionsAsync()
    if (permission.granted || permission.canAskAgain) await start()
    else await Linking.openSettings()
  }, [start])

  const stopRef = useRef(stop)
  useEffect(() => {
    stopRef.current = stop
  }, [stop])

  useEffect(() => () => stopRef.current(), [])

  return { levelRef, state, start, stop, setDeaf, enableMicrophone }
}
