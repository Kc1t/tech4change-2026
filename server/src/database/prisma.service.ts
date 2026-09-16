import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Prisma connected')
    } catch {
      this.logger.warn('Prisma unavailable — running with in-memory fallbacks')
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined)
  }
}
