export const TRANSCRIBE_URL = '/pitch/api/transcribe'

export type EarEvents = {
  onVoice: () => void
  onPartial: (segment: number, text: string) => void
  onCommit: (segment: number, text: string, ms: number) => void
  onFail: () => void
}

export type CloudEar = {
  stop: () => void
  settle: (timeoutMs: number) => Promise<void>
  idle: () => boolean
  mute: (on: boolean) => void
  level: () => number
}

const TICK_MS = 50
const TIMESLICE_MS = 250
const MIN_VOICED_MS = 250
const COMMIT_SILENCE_MS = 300
const PARTIAL_EVERY_MS = 750
const PARTIAL_MIN_VOICED_MS = 1000
const MAX_SEGMENT_MS = 18_000
const IDLE_RECYCLE_MS = 8_000
const MAX_FAILURES = 2
const UNMUTE_TAIL_MS = 350

function pickMime(): string | undefined {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  return options.find(type => MediaRecorder.isTypeSupported(type))
}

const SEND_TIMEOUT_MS = 9000

async function send(blob: Blob, audioMs: number): Promise<{ text: string; ms: number } | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null
  const started = performance.now()
  try {
    const response = await fetch(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'audio/webm', 'X-Audio-Ms': String(Math.round(audioMs)) },
      body: blob,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
    })
    const ms = Math.round(performance.now() - started)
    if (response.status === 400 || response.status === 413 || response.status === 422) return { text: '', ms }
    if (!response.ok) return null
    const body = (await response.json()) as { text?: unknown }
    return typeof body.text === 'string' ? { text: body.text, ms } : null
  } catch {
    return null
  }
}

type Segment = {
  id: number
  recorder: MediaRecorder
  chunks: Blob[]
  startedAt: number
  voicedMs: number
  lastPartialAt: number
  partialInFlight: boolean
  closed: boolean
}

export async function startCloudEar(events: EarEvents): Promise<CloudEar | null> {
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
    })
  } catch {
    return null
  }

  const mimeType = pickMime()
  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  context.createMediaStreamSource(stream).connect(analyser)
  const samples = new Float32Array(analyser.fftSize)
  const wake = () => {
    if (context.state === 'suspended') void context.resume()
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') wake()
  }
  wake()
  window.addEventListener('pointerdown', wake)
  window.addEventListener('keydown', wake)
  document.addEventListener('visibilitychange', onVisible)

  let stopped = false
  let failures = 0
  let nextId = 0
  let floor = 0.01
  let lastVoiceAt = 0
  let muted = false
  let deafUntil = 0
  let dropAfterTail = false
  let lastRms = 0
  const pending = new Set<Promise<void>>()
  let segment = open()

  function open(): Segment {
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const created: Segment = {
      id: nextId++,
      recorder,
      chunks: [],
      startedAt: performance.now(),
      voicedMs: 0,
      lastPartialAt: performance.now(),
      partialInFlight: false,
      closed: false
    }
    recorder.ondataavailable = event => {
      if (event.data.size > 0) created.chunks.push(event.data)
    }
    recorder.start(TIMESLICE_MS)
    return created
  }

  function track(result: Promise<{ text: string; ms: number } | null>, apply: (text: string, ms: number) => void) {
    const job = result.then(outcome => {
      if (stopped) return
      if (!outcome) {
        failures += 1
        if (failures >= MAX_FAILURES) events.onFail()
        return
      }
      failures = 0
      apply(outcome.text, outcome.ms)
    })
    pending.add(job)
    void job.finally(() => pending.delete(job))
  }

  function blobOf(target: Segment): Blob {
    return new Blob(target.chunks, { type: target.recorder.mimeType || mimeType || 'audio/webm' })
  }

  function commit(target: Segment) {
    target.closed = true
    const done = new Promise<{ text: string; ms: number } | null>(resolve => {
      target.recorder.onstop = () => resolve(target.voicedMs >= MIN_VOICED_MS ? send(blobOf(target), performance.now() - target.startedAt) : null)
    })
    target.recorder.stop()
    track(done, (text, ms) => events.onCommit(target.id, text, ms))
  }

  function recycle(target: Segment) {
    target.closed = true
    target.recorder.onstop = null
    target.recorder.stop()
  }

  function partial(target: Segment, now: number) {
    target.partialInFlight = true
    target.lastPartialAt = now
    const job = send(blobOf(target), now - target.startedAt)
    track(job, text => {
      if (!target.closed) events.onPartial(target.id, text)
    })
    void job.finally(() => {
      target.partialInFlight = false
    })
  }

  function restart() {
    if (segment.voicedMs >= MIN_VOICED_MS) commit(segment)
    else recycle(segment)
    segment = open()
  }

  const tick = window.setInterval(() => {
    const now = performance.now()
    if (muted || now < deafUntil) {
      lastRms = 0
      return
    }
    if (dropAfterTail) {
      dropAfterTail = false
      recycle(segment)
      segment = open()
      lastVoiceAt = 0
    }
    analyser.getFloatTimeDomainData(samples)
    let sum = 0
    for (const value of samples) sum += value * value
    const rms = Math.sqrt(sum / samples.length)
    lastRms = rms
    const voiced = rms > Math.max(0.012, floor * 2.5)
    floor = voiced ? floor * 0.997 + rms * 0.003 : floor * 0.95 + rms * 0.05
    if (voiced) {
      lastVoiceAt = now
      segment.voicedMs += TICK_MS
      events.onVoice()
    }

    const age = now - segment.startedAt
    const silence = now - lastVoiceAt
    if (segment.voicedMs >= MIN_VOICED_MS) {
      if (silence >= COMMIT_SILENCE_MS || age >= MAX_SEGMENT_MS) {
        commit(segment)
        segment = open()
      } else if (!segment.partialInFlight && segment.voicedMs >= PARTIAL_MIN_VOICED_MS && now - segment.lastPartialAt >= PARTIAL_EVERY_MS && segment.chunks.length > 0) {
        partial(segment, now)
      }
    } else if (age >= IDLE_RECYCLE_MS && silence >= 1000) {
      recycle(segment)
      segment = open()
    }
  }, TICK_MS)

  return {
    stop() {
      if (stopped) return
      stopped = true
      window.clearInterval(tick)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
      document.removeEventListener('visibilitychange', onVisible)
      segment.recorder.onstop = null
      if (segment.recorder.state !== 'inactive') segment.recorder.stop()
      stream.getTracks().forEach(track => track.stop())
      void context.close()
    },
    mute(on: boolean) {
      if (stopped || muted === on) return
      muted = on
      if (on) restart()
      else {
        deafUntil = performance.now() + UNMUTE_TAIL_MS
        dropAfterTail = true
      }
    },
    level() {
      return stopped ? 0 : lastRms
    },
    idle() {
      return pending.size === 0 && segment.voicedMs < MIN_VOICED_MS
    },
    async settle(timeoutMs: number) {
      if (pending.size === 0) return
      await Promise.race([
        Promise.allSettled([...pending]),
        new Promise(resolve => window.setTimeout(resolve, timeoutMs))
      ])
    }
  }
}
