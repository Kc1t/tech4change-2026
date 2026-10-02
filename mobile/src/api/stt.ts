import { apiBase } from '../sync/client'

const CONNECT_TIMEOUT_MS = 3000
const MAX_KEYTERMS = 24
const TRANSCRIPT_TAIL = 160

interface FluxMessage {
  type?: string
  event?: string
  transcript?: string
}

export interface Transcriber {
  send: (samples: Float32Array) => void
  stop: () => void
}

interface TranscriberOptions {
  keyterms: string[]
  onText: (text: string) => void
  onLost: () => void
}

function tail(text: string): string {
  if (text.length <= TRANSCRIPT_TAIL) return text
  const cut = text.slice(-TRANSCRIPT_TAIL)
  const space = cut.indexOf(' ')
  return space === -1 ? cut : cut.slice(space + 1)
}

function streamUrl(keyterms: string[]): string {
  const query = keyterms
    .slice(0, MAX_KEYTERMS)
    .map(term => `keyterm=${encodeURIComponent(term)}`)
    .join('&')
  return `${apiBase().replace(/^http/, 'ws')}/v1/stt?${query}`
}

function toLinear16(samples: Float32Array): ArrayBuffer {
  const pcm = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]!))
    pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return pcm.buffer
}

function parse(data: unknown): FluxMessage | null {
  try {
    return JSON.parse(String(data)) as FluxMessage
  } catch {
    return null
  }
}

function openSocket(url: string): Promise<WebSocket | null> {
  return new Promise(resolve => {
    let settled = false
    const socket = new WebSocket(url)
    socket.binaryType = 'arraybuffer'

    const settle = (value: WebSocket | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (value === null) socket.close()
      resolve(value)
    }

    const timer = setTimeout(() => settle(null), CONNECT_TIMEOUT_MS)
    socket.onmessage = event => {
      if (parse(event.data)?.type === 'Connected') settle(socket)
    }
    socket.onerror = () => settle(null)
    socket.onclose = () => settle(null)
  })
}

export async function startTranscriber(options: TranscriberOptions): Promise<Transcriber | null> {
  const socket = await openSocket(streamUrl(options.keyterms))
  if (!socket) return null

  let committed = ''
  let stopped = false

  socket.onmessage = event => {
    const message = parse(event.data)
    if (message?.type !== 'TurnInfo') return

    const said = (message.transcript ?? '').trim()
    if (message.event === 'EndOfTurn') {
      committed = tail(`${committed} ${said}`.trim())
      options.onText(committed)
      return
    }
    options.onText(tail(`${committed} ${said}`.trim()))
  }

  socket.onclose = () => {
    if (stopped) return
    stopped = true
    options.onLost()
  }

  return {
    send: samples => {
      if (socket.readyState === WebSocket.OPEN) socket.send(toLinear16(samples))
    },
    stop: () => {
      if (stopped) return
      stopped = true
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'CloseStream' }))
      socket.close()
    }
  }
}
