import { BadRequestException, Controller, Get, Query, Res, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { TTS_MAX_TEXT_LENGTH } from '../../common/constants'
import { isVoice, TtsService } from './tts.service'

@ApiTags('tts')
@Controller('tts')
export class TtsController {
  constructor(private readonly tts: TtsService) {}

  @Get('voices')
  voices() {
    return this.tts.voices()
  }

  @Get()
  async speak(
    @Query('text') text: string | undefined,
    @Query('voice') voice: string | undefined,
    @Res() response: Response
  ) {
    const clean = text?.trim()
    if (!clean || clean.length > TTS_MAX_TEXT_LENGTH) throw new BadRequestException()
    if (voice !== undefined && !isVoice(voice)) throw new BadRequestException()

    const audio = await this.tts.speak(clean, voice)
    if (!audio) throw new ServiceUnavailableException()

    response
      .setHeader('content-type', 'audio/mpeg')
      .setHeader('cache-control', 'public, max-age=86400')
      .send(audio)
  }
}
