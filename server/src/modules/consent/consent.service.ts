import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import type { SetConsentInput } from './dto/set-consent.dto'

const DENIED: SetConsentInput = {
  listening: false,
  photos: false,
  clinician: false,
  research: false
}

@Injectable()
export class ConsentService {
  private readonly memory = new Map<string, SetConsentInput>()

  constructor(private readonly prisma: PrismaService) {}

  async get(subject: string) {
    const row = await this.prisma.consentRecord.findUnique({ where: { subject } }).catch(() => null)
    if (row) return row
    return { subject, ...(this.memory.get(subject) ?? DENIED), updatedAt: null }
  }

  async set(subject: string, input: SetConsentInput) {
    this.memory.set(subject, input)
    const row = await this.prisma.consentRecord
      .upsert({ where: { subject }, create: { subject, ...input }, update: input })
      .catch(() => null)

    return row ?? { subject, ...input, updatedAt: null }
  }
}
