import { LIMITS } from './limits'

export type AudioFormat = 'webm' | 'ogg' | 'm4a' | 'mp3' | 'flac' | 'wav'

export function audioFormatOf(contentType: string): AudioFormat | null {
  const type = contentType.toLowerCase().split(';')[0].trim()
  if (type === 'audio/webm' || type === 'video/webm') return 'webm'
  if (type === 'audio/ogg' || type === 'audio/opus') return 'ogg'
  if (type === 'audio/mp4' || type === 'audio/m4a' || type === 'audio/x-m4a' || type === 'audio/aac') return 'm4a'
  if (type === 'audio/mpeg' || type === 'audio/mp3') return 'mp3'
  if (type === 'audio/flac' || type === 'audio/x-flac') return 'flac'
  if (type === 'audio/wav' || type === 'audio/x-wav' || type === 'audio/wave') return 'wav'
  return null
}

export function sniffAudio(bytes: Uint8Array): AudioFormat | null {
  const ascii = (start: number, text: string) => [...text].every((ch, i) => bytes[start + i] === ch.charCodeAt(0))
  if (bytes.length < 12) return null
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'webm'
  if (ascii(0, 'OggS')) return 'ogg'
  if (ascii(4, 'ftyp')) return 'm4a'
  if (ascii(0, 'RIFF') && ascii(8, 'WAVE')) return 'wav'
  if (ascii(0, 'fLaC')) return 'flac'
  if (ascii(0, 'ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return 'mp3'
  return null
}

export type AudioCheck = { ok: true; format: AudioFormat } | { ok: false; status: 413 | 415 | 422; error: string }

export function checkAudio(bytes: Uint8Array, contentType: string, declaredMs: string | null): AudioCheck {
  const declared = audioFormatOf(contentType)
  if (!declared) return { ok: false, status: 415, error: 'unsupported media type' }
  if (bytes.byteLength > LIMITS.audioMaxBytes) return { ok: false, status: 413, error: 'audio too large' }
  if (declaredMs !== null) {
    const ms = Number(declaredMs)
    if (!Number.isFinite(ms) || ms < 0) return { ok: false, status: 422, error: 'bad duration' }
    if (ms > LIMITS.audioMaxMs) return { ok: false, status: 413, error: 'audio too long' }
  }
  if (bytes.byteLength < LIMITS.audioMinBytes) return { ok: false, status: 422, error: 'audio too short' }
  const sniffed = sniffAudio(bytes)
  if (!sniffed) return { ok: false, status: 415, error: 'unrecognised audio' }
  return { ok: true, format: sniffed }
}
