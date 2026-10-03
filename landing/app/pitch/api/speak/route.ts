import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fold, isOffensive } from '../../eilo/text-safety'
import { deadline, fail, rateLimited, warmed } from '../../eilo/http'
import { openRouterReady, speech, warmUpstream } from '../../eilo/openrouter'

export const dynamic = 'force-dynamic'

const RECORDED_DIR = path.join(process.cwd(), 'public', 'pitch', 'voz', 'gia')

const VOICES: Record<string, string> = {
  luana: 'pt-BR-Luana:MAI-Voice-2.1-Flash',
  harper: 'pt-BR-Harper:MAI-Voice-2.1-Flash',
  caio: 'pt-BR-Caio:MAI-Voice-2.1-Flash',
  pedro: 'pt-BR-Pedro:MAI-Voice-2.1-Flash',
  rafael: 'pt-BR-Rafael:MAI-Voice-2.1-Flash'
}
const DEFAULT_VOICE = 'luana'
const SPEED = 1.1
const MAX_CHARS = 80
const TIMEOUT_MS = 6000
const CACHE_SIZE = 200
const MAX_AUDIO_BYTES = 1_000_000

type Cache = Map<string, Promise<Uint8Array | null>>
const globalCache = globalThis as unknown as { pitchSpeech?: Cache }
const cache = (globalCache.pitchSpeech ??= new Map())

function providerVoice(): string {
  const configured = process.env.EILO_VOICE_ID?.trim() ?? ''
  if (VOICES[configured.toLowerCase()]) return VOICES[configured.toLowerCase()]
  if (/^[A-Za-z]{2}-[A-Za-z]{2}-[A-Za-z]+:[\w.-]+$/.test(configured)) return configured
  return VOICES[DEFAULT_VOICE]
}

function spokenText(raw: string | null): string | null {
  if (raw === null || raw.length > MAX_CHARS * 2) return null
  const text = raw.replace(/…|\.{3}/g, '').replace(/\s+/g, ' ').trim()
  if (!text || text.length > MAX_CHARS) return null
  if (!/^[\p{L}\p{N} ,.!?'’-]+$/u.test(text) || !/\p{L}/u.test(text)) return null
  return isOffensive(text) ? null : text
}

async function recorded(text: string): Promise<Uint8Array | null> {
  const name = fold(text).replace(/ /g, '-')
  if (!/^[a-z0-9-]{1,60}$/.test(name)) return null
  return readFile(path.join(RECORDED_DIR, `${name}.mp3`)).then(
    buffer => new Uint8Array(buffer),
    () => null
  )
}

function audioResponse(audio: Uint8Array, cacheControl: string): Response {
  return new Response(audio.slice().buffer, {
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(audio.byteLength), 'Cache-Control': cacheControl }
  })
}

async function synthesize(text: string, voice: string, signal: AbortSignal): Promise<Uint8Array | null> {
  const audio = await speech(text, voice, SPEED, signal)
  if (!audio) console.warn('[pitch/speak] OpenRouter voice skipped')
  return audio && audio.byteLength <= MAX_AUDIO_BYTES ? audio : null
}

function speak(text: string): Promise<Uint8Array | null> {
  const voice = providerVoice()
  const key = `${voice}:${text}`
  const cached = cache.get(key)
  if (cached) {
    cache.delete(key)
    cache.set(key, cached)
    return cached
  }
  const pending = synthesize(text, voice, AbortSignal.timeout(TIMEOUT_MS)).then(audio => {
    if (!audio) cache.delete(key)
    return audio
  })
  cache.set(key, pending)
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!)
  return pending
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  if (params.has('warm')) return warmed(request, warmUpstream)
  const text = spokenText(params.get('text'))
  if (!text) return fail(400, 'invalid text')
  const limited = rateLimited(request, 'speak', { limit: 40, windowMs: 60_000 })
  if (limited) return limited
  const clip = await recorded(text)
  if (clip) return audioResponse(clip, 'no-cache')
  if (!openRouterReady()) return fail(503, 'voice unavailable')
  const audio = await Promise.race([
    speak(text),
    new Promise<null>(resolve => deadline(request, TIMEOUT_MS + 500).addEventListener('abort', () => resolve(null)))
  ])
  if (!audio) return fail(502, 'voice failed')
  return audioResponse(audio, 'private, max-age=86400')
}
