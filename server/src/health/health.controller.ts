import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../database/prisma.service'
import { RerankService } from '../modules/cue/rerank.service'
import { SttGateway } from '../modules/stt/stt.gateway'
import { TtsService } from '../modules/tts/tts.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rerank: RerankService,
    private readonly stt: SttGateway,
    private readonly tts: TtsService
  ) {}

  @Get()
  async check() {
    const db = await this.prisma
      .$queryRaw`SELECT 1`
      .then(() => 'ok')
      .catch(() => 'error')

    const model = this.rerank.available() ? 'configured' : 'absent'
    const stt = this.stt.available() ? 'configured' : 'absent'
    const voice = this.tts.available() ? 'configured' : 'absent'

    return { status: db === 'ok' ? 'ok' : 'degraded', db, model, stt, voice }
  }
}
