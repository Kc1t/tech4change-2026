import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const OPAQUE_ID = z.string().min(1).max(64).regex(/^[a-z0-9][a-z0-9_:-]*$/)

const RecordEventSchema = z.object({
  subject: OPAQUE_ID,
  targetId: OPAQUE_ID,
  event: z.enum(['block', 'step', 'resolved', 'abandoned']),
  level: z.number().int().min(0).max(12),
  origin: z.enum(['model', 'cache', 'deterministic']),
  channel: z.enum(['phone', 'earbuds', 'watch', 'none']),
  elapsedMs: z.number().int().min(0).max(600_000),
  occurredAt: z.string().datetime()
})

export class RecordEventDto extends createZodDto(RecordEventSchema) {}
export type RecordEventInput = z.infer<typeof RecordEventSchema>
