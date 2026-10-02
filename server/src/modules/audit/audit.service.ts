import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import type { RecordEventInput } from './dto/record-event.dto'

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)
  private readonly memory: RecordEventInput[] = []

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordEventInput): Promise<{ stored: 'database' | 'memory' }> {
    if (!this.prisma.connected) {
      this.memory.push(input)
      return { stored: 'memory' }
    }

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
    if (!this.prisma.connected) return this.fromMemory(subject, take)

    return this.prisma.auditEvent
      .findMany({ where: { subject }, orderBy: { occurredAt: 'desc' }, take })
      .catch(() => this.fromMemory(subject, take))
  }

  async subjects(take = 20) {
    if (this.prisma.connected) {
      const rows = await this.prisma.auditEvent
        .groupBy({
          by: ['subject'],
          _max: { occurredAt: true },
          _count: { _all: true },
          orderBy: { _max: { occurredAt: 'desc' } },
          take
        })
        .catch(() => null)
      if (rows) {
        return rows.map(row => ({
          subject: row.subject,
          lastSeen: row._max.occurredAt?.toISOString() ?? null,
          events: row._count._all
        }))
      }
    }

    const bySubject = new Map<string, { subject: string; lastSeen: string; events: number }>()
    for (const event of this.memory) {
      const current = bySubject.get(event.subject)
      bySubject.set(event.subject, {
        subject: event.subject,
        lastSeen: !current || event.occurredAt > current.lastSeen ? event.occurredAt : current.lastSeen,
        events: (current?.events ?? 0) + 1
      })
    }
    return [...bySubject.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0, take)
  }

  private fromMemory(subject: string, take: number) {
    return this.memory.filter(event => event.subject === subject).slice(-take).reverse()
  }
}
