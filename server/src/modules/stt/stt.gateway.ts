import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import type { IncomingMessage, Server } from 'http'
import type { Duplex } from 'stream'
import WebSocket, { WebSocketServer, type RawData } from 'ws'
import {
  STT_MAX_KEYTERMS,
  STT_MAX_KEYTERM_LENGTH,
  STT_MAX_PENDING_CHUNKS,
  STT_MAX_SESSIONS,
  STT_MAX_SESSION_MS,
  STT_MODEL,
  STT_PATH
} from '../../common/constants'

export function fluxUrl(keyterms: string[]): string {
  const params = new URLSearchParams([
    ['model', STT_MODEL],
    ['language_hint', 'pt'],
    ['encoding', 'linear16'],
    ['sample_rate', '16000'],
    ['mip_opt_out', 'true']
  ])
  for (const term of keyterms) params.append('keyterm', term)
  return `wss://api.deepgram.com/v2/listen?${params}`
}

export function keytermsFrom(url: URL): string[] {
  const unique = new Set(
    url.searchParams
      .getAll('keyterm')
      .map(term => term.trim())
      .filter(term => term.length > 0 && term.length <= STT_MAX_KEYTERM_LENGTH)
  )
  return [...unique].slice(0, STT_MAX_KEYTERMS)
}

function originAllowed(origin: string | undefined): boolean {
  const allowed = process.env.CORS_ORIGINS
  if (!allowed || allowed === '*') return true
  return origin !== undefined && allowed.split(',').includes(origin)
}

function reject(socket: Duplex, status: number, reason: string) {
  socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`)
  socket.destroy()
}

@Injectable()
export class SttGateway implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(SttGateway.name)
  private readonly wss = new WebSocketServer({ noServer: true })

  constructor(private readonly adapter: HttpAdapterHost) {}

  available(): boolean {
    return Boolean(process.env.DEEPGRAM_API_KEY)
  }

  onApplicationBootstrap() {
    const server = this.adapter.httpAdapter.getHttpServer() as Server
    server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) =>
      this.upgrade(request, socket, head)
    )
  }

  onApplicationShutdown() {
    for (const client of this.wss.clients) client.terminate()
    this.wss.close()
  }

  private upgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (url.pathname !== STT_PATH) return reject(socket, 404, 'Not Found')
    if (!this.available()) return reject(socket, 503, 'Service Unavailable')
    if (!originAllowed(request.headers.origin)) return reject(socket, 403, 'Forbidden')
    if (this.wss.clients.size >= STT_MAX_SESSIONS) return reject(socket, 429, 'Too Many Requests')

    this.wss.handleUpgrade(request, socket, head, client => this.relay(client, keytermsFrom(url)))
  }

  private relay(client: WebSocket, keyterms: string[]) {
    const upstream = new WebSocket(fluxUrl(keyterms), {
      headers: { authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
    })
    const pending: RawData[] = []
    let closed = false

    const close = () => {
      if (closed) return
      closed = true
      clearTimeout(limit)
      if (upstream.readyState === WebSocket.OPEN) upstream.send(JSON.stringify({ type: 'CloseStream' }))
      upstream.terminate()
      client.close()
    }

    const limit = setTimeout(close, STT_MAX_SESSION_MS)

    client.on('message', (data, isBinary) => {
      if (!isBinary) return
      if (upstream.readyState === WebSocket.OPEN) upstream.send(data)
      else if (upstream.readyState === WebSocket.CONNECTING && pending.length < STT_MAX_PENDING_CHUNKS) {
        pending.push(data)
      }
    })

    upstream.on('open', () => {
      for (const chunk of pending.splice(0)) upstream.send(chunk)
    })

    upstream.on('message', (data, isBinary) => {
      if (!isBinary && client.readyState === WebSocket.OPEN) client.send(data.toString())
    })

    upstream.on('unexpected-response', (request, response) => {
      this.logger.warn(`Deepgram refused the stream: ${response.statusCode}`)
      request.destroy()
      close()
    })

    upstream.on('error', error => {
      this.logger.warn(`Deepgram stream failed: ${error.message}`)
      close()
    })

    upstream.on('close', close)
    client.on('close', close)
    client.on('error', close)
  }
}
