import { Injectable, Logger } from '@nestjs/common'
import {
  TTS_CACHE_SIZE,
  TTS_MODEL,
  TTS_OUTPUT_FORMAT,
  TTS_TIMEOUT_MS,
  TTS_VOICES,
  TTS_VOICE_SETTINGS
} from '../../common/constants'

export type VoiceId = (typeof TTS_VOICES)[number]['id']

export function isVoice(id: string): id is VoiceId {
  return TTS_VOICES.some(voice => voice.id === id)
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name)
  private readonly cache = new Map<string, Promise<Buffer | null>>()

  available(): boolean {
    return Boolean(process.env.ELEVENLABS_API_KEY)
  }

  voices() {
    return TTS_VOICES.map(({ id, name, description }) => ({ id, name, description }))
  }

  speak(text: string, voice: VoiceId = TTS_VOICES[0].id): Promise<Buffer | null> {
    const key = `${voice}:${text.trim()}`
    const cached = this.cache.get(key)
    if (cached) {
      this.cache.delete(key)
      this.cache.set(key, cached)
      return cached
    }

    const pending = this.synthesize(text.trim(), voice).then(audio => {
      if (!audio) this.cache.delete(key)
      return audio
    })
    this.cache.set(key, pending)
    if (this.cache.size > TTS_CACHE_SIZE) this.cache.delete(this.cache.keys().next().value!)
    return pending
  }

  private async synthesize(text: string, voice: VoiceId): Promise<Buffer | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return null

    const providerId = TTS_VOICES.find(option => option.id === voice)!.providerId
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS)

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${providerId}?output_format=${TTS_OUTPUT_FORMAT}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'content-type': 'application/json', 'xi-api-key': apiKey },
          body: JSON.stringify({
            text,
            model_id: TTS_MODEL,
            language_code: 'pt',
            voice_settings: TTS_VOICE_SETTINGS
          })
        }
      )

      if (!response.ok) {
        this.logger.warn(`ElevenLabs responded ${response.status}`)
        return null
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      this.logger.warn(`ElevenLabs skipped: ${(error as Error).name}`)
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}
