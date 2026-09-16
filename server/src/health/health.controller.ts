import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../database/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const db = await this.prisma
      .$queryRaw`SELECT 1`
      .then(() => 'ok')
      .catch(() => 'error')

    const model = process.env.ANTHROPIC_API_KEY ? 'configured' : 'absent'

    return { status: db === 'ok' ? 'ok' : 'degraded', db, model }
  }
}
