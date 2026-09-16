import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import type { RecordEventInput } from './dto/record-event.dto'

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)
  private readonly memory: RecordEventInput[] = []

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordEventInput): Promise<{ stored: 'database' | 'memory' }> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          subject: input.subject,
          targetId: input.targetId,
          event: input.event,
          level: input.level,
          origin: input.origin,
          channel: input.channel,
          elapsedMs: input.elapsedMs,
          occurredAt: new Date(input.occurredAt)
        }
      })
      return { stored: 'database' }
    } catch {
      this.memory.push(input)
      this.logger.debug('Audit event kept in memory')
      return { stored: 'memory' }
    }
  }

  async listBySubject(subject: string, take = 200) {
    return this.prisma.auditEvent
      .findMany({ where: { subject }, orderBy: { occurredAt: 'desc' }, take })
      .catch(() => this.memory.filter(event => event.subject === subject).slice(-take).reverse())
  }
}
