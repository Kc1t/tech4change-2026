import { useCallback, useEffect, useRef, useState } from 'react'
import { File } from 'expo-file-system'
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder
} from 'expo-audio'

const OPTIONS = { ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true }

const SAMPLE_MS = 60
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

export interface ListeningState {
  active: boolean
  denied: boolean
  calibrating: boolean
  noisy: boolean
  speaking: boolean
}

const IDLE: ListeningState = {
  active: false,
  denied: false,
  calibrating: false,
  noisy: false,
  speaking: false
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))
  return sorted[index]!
}

function amplitude(decibels: number | undefined): number | null {
  if (decibels === undefined || Number.isNaN(decibels)) return null
  if (decibels <= -160) return 0
  return Math.min(1, Math.pow(10, decibels / 20))
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

function discard(uri: string | null) {
  if (!uri) return
  try {
    const file = new File(uri)
    if (file.exists) file.delete()
  } catch {
    return
  }
}

export function useListening(onBlock: () => void) {
  const recorder = useAudioRecorder(OPTIONS)
  const [state, setState] = useState<ListeningState>(IDLE)

  const levelRef = useRef(0)
  const deafRef = useRef(false)
  const meterRef = useRef<Meter>(freshMeter(0))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const blockHandler = useRef(onBlock)
  blockHandler.current = onBlock

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    levelRef.current = 0
    deafRef.current = false
  }, [])

  const stop = useCallback(() => {
    teardown()

    try {
      if (recorder.isRecording) {
        const pending = recorder.uri
        void recorder
          .stop()
          .then(() => discard(recorder.uri ?? pending))
          .catch(() => discard(pending))
      } else {
        discard(recorder.uri)
      }
    } catch {
      setState(IDLE)
      return
    }

    setState(IDLE)
  }, [recorder, teardown])

  const setDeaf = useCallback((deaf: boolean) => {
    deafRef.current = deaf
    if (deaf) return
    const meter = meterRef.current
    meter.speaking = false
    meter.silenceStartedAt = 0
    levelRef.current = 0
    setState(previous => (previous.speaking ? { ...previous, speaking: false } : previous))
  }, [])

  const start = useCallback(async () => {
    if (timerRef.current !== null) return

    const permission = await requestRecordingPermissionsAsync()
    if (!permission.granted) {
      setState({ ...IDLE, denied: true })
      return
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers'
    })

    await recorder.prepareToRecordAsync(OPTIONS)
    recorder.record()

    meterRef.current = freshMeter(Date.now())
    setState({ ...IDLE, active: true, calibrating: true })

    function applyFloor(meter: Meter, next: number) {
      meter.floor = next
      meter.speechOn = Math.max(ON_MINIMUM, next * ON_RATIO)
      meter.speechOff = Math.max(OFF_MINIMUM, next * OFF_RATIO)
    }

    timerRef.current = setInterval(() => {
      let metering: number | undefined
      try {
        metering = recorder.getStatus().metering
      } catch {
        teardown()
        return
      }

      const rms = amplitude(metering)
      if (rms === null) return

      const meter = meterRef.current
      const now = Date.now()

      if (!meter.calibrated) {
        meter.calibration.push(rms)
        if (now >= meter.calibrationEndsAt) {
          applyFloor(meter, percentile(meter.calibration, FLOOR_PERCENTILE))
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
        const paused = now - meter.silenceStartedAt >= BLOCK_SILENCE_MS

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
          applyFloor(meter, drifted)
          const noisy = meter.floor > NOISY_FLOOR
          setState(previous => (previous.noisy === noisy ? previous : { ...previous, noisy }))
        }
      }
    }, SAMPLE_MS)
  }, [recorder, teardown])

  useEffect(() => teardown, [teardown])

  return { levelRef, state, start, stop, setDeaf }
}
