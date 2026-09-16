import { Injectable } from '@nestjs/common'
import { AuditService } from '../audit/audit.service'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

interface WeeklyPoint {
  week: number
  averageLevel: number
  attempts: number
}

interface TargetSummary {
  targetId: string
  averageLevel: number
  attempts: number
  state: 'unaided' | 'one_rung' | 'full_ladder'
}

@Injectable()
export class ClinicianService {
  constructor(private readonly audit: AuditService) {}

  async summary(subject: string) {
    const events = (await this.audit.listBySubject(subject, 2000)).filter(
      event => event.event === 'resolved'
    )

    if (events.length === 0) {
      return { subject, attempts: 0, averageLevel: null, trend: [], targets: [], blocks: 0 }
    }

    const times = events.map(event => new Date(event.occurredAt).getTime())
    const origin = Math.min(...times)

    const weeks = new Map<number, number[]>()
    const targets = new Map<string, number[]>()

    for (const event of events) {
      const week = Math.floor((new Date(event.occurredAt).getTime() - origin) / WEEK_MS)
      weeks.set(week, [...(weeks.get(week) ?? []), event.level])
      targets.set(event.targetId, [...(targets.get(event.targetId) ?? []), event.level])
    }

    const trend: WeeklyPoint[] = [...weeks.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, levels]) => ({
        week: week + 1,
        averageLevel: average(levels),
        attempts: levels.length
      }))

    const byTarget: TargetSummary[] = [...targets.entries()]
      .map(([targetId, levels]) => {
        const averageLevel = average(levels)
        return {
          targetId,
          averageLevel,
          attempts: levels.length,
          state: stateFor(averageLevel)
        }
      })
      .sort((a, b) => b.averageLevel - a.averageLevel)

    const all = await this.audit.listBySubject(subject, 2000)

    return {
      subject,
      attempts: events.length,
      averageLevel: average(events.map(event => event.level)),
      trend,
      targets: byTarget,
      blocks: all.filter(event => event.event === 'block').length
    }
  }
}

function average(values: number[]): number {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
}

function stateFor(level: number): TargetSummary['state'] {
  if (level <= 0.5) return 'unaided'
  if (level <= 2) return 'one_rung'
  return 'full_ladder'
}
