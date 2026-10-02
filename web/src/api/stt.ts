const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const TARGET_RATE = 16000
const CHUNK_SAMPLES = 1280
const CONNECT_TIMEOUT_MS = 3000
const MAX_KEYTERMS = 24
const TRANSCRIPT_TAIL = 160

const WORKLET = `
class Pcm16Downsampler extends AudioWorkletProcessor {
  constructor() {
    super()
    this.ratio = sampleRate / ${TARGET_RATE}
    this.position = 0
    this.chunk = new Int16Array(${CHUNK_SAMPLES})
    this.filled = 0
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true
    while (this.position < channel.length) {
      const index = Math.floor(this.position)
      const next = index + 1 < channel.length ? channel[index + 1] : channel[index]
      const value = channel[index] + (next - channel[index]) * (this.position - index)
      const clamped = Math.max(-1, Math.min(1, value))
      this.chunk[this.filled++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
      if (this.filled === this.chunk.length) {
        this.port.postMessage(this.chunk.buffer, [this.chunk.buffer])
        this.chunk = new Int16Array(${CHUNK_SAMPLES})
        this.filled = 0
      }
      this.position += this.ratio
    }
    this.position -= channel.length
    return true
  }
}
registerProcessor('pcm16-downsampler', Pcm16Downsampler)
`

interface FluxMessage {
  type?: string
  event?: string
  transcript?: string
}

export interface Transcriber {
  stop: () => void
}

interface TranscriberOptions {
  context: AudioContext
  source: MediaStreamAudioSourceNode
  keyterms: string[]
  onText: (text: string) => void
  onLost: () => void
}

export function cloudTranscriptionConfigured(): boolean {
  return BASE.length > 0 && typeof AudioWorkletNode !== 'undefined'
}

function tail(text: string): string {
  if (text.length <= TRANSCRIPT_TAIL) return text
  const cut = text.slice(-TRANSCRIPT_TAIL)
  const space = cut.indexOf(' ')
  return space === -1 ? cut : cut.slice(space + 1)
}

function streamUrl(keyterms: string[]): string {
  const params = new URLSearchParams()
  for (const term of keyterms.slice(0, MAX_KEYTERMS)) params.append('keyterm', term)
  return `${BASE.replace(/^http/, 'ws')}/v1/stt?${params}`
}

function openSocket(url: string): Promise<WebSocket | null> {
  return new Promise(resolve => {
    let settled = false
    const socket = new WebSocket(url)

    const settle = (value: WebSocket | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (value === null) socket.close()
      resolve(value)
    }

    const timer = setTimeout(() => settle(null), CONNECT_TIMEOUT_MS)
    socket.onmessage = event => {
      const message = JSON.parse(String(event.data)) as FluxMessage
      if (message.type === 'Connected') settle(socket)
    }
    socket.onerror = () => settle(null)
    socket.onclose = () => settle(null)
  })
}

export async function startCloudTranscriber(options: TranscriberOptions): Promise<Transcriber | null> {
  if (!cloudTranscriptionConfigured()) return null

  const socket = await openSocket(streamUrl(options.keyterms))
  if (!socket) return null

  const moduleUrl = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))
  try {
    await options.context.audioWorklet.addModule(moduleUrl)
  } catch {
    socket.close()
    return null
  } finally {
    URL.revokeObjectURL(moduleUrl)
  }

  const downsampler = new AudioWorkletNode(options.context, 'pcm16-downsampler')
  const silent = options.context.createGain()
  silent.gain.value = 0
  options.source.connect(downsampler)
  downsampler.connect(silent)
  silent.connect(options.context.destination)

  downsampler.port.onmessage = event => {
    if (socket.readyState === WebSocket.OPEN) socket.send(event.data as ArrayBuffer)
  }

  let committed = ''
  let stopped = false

  socket.onmessage = event => {
    const message = JSON.parse(String(event.data)) as FluxMessage
    if (message.type !== 'TurnInfo') return

    const said = (message.transcript ?? '').trim()
    if (message.event === 'EndOfTurn') {
      committed = tail(`${committed} ${said}`.trim())
      options.onText(committed)
      return
    }
    options.onText(tail(`${committed} ${said}`.trim()))
  }

  const release = () => {
    downsampler.port.onmessage = null
    options.source.disconnect(downsampler)
    downsampler.disconnect()
    silent.disconnect()
  }

  socket.onclose = () => {
    if (stopped) return
    stopped = true
    release()
    options.onLost()
  }

  return {
    stop: () => {
      if (stopped) return
      stopped = true
      release()
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'CloseStream' }))
      socket.close()
    }
  }
}
