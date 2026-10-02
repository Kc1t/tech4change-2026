import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ASK_MAX_QUESTION } from '../../../common/constants'

const OPAQUE_ID = z.string().min(1).max(64).regex(/^[a-z0-9][a-z0-9_:-]*$/)
const LEVEL = z.number().min(0).max(12)

const StatsSchema = z.object({
  blocks: z.number().int().min(0).max(100_000),
  resolved: z.number().int().min(0).max(100_000),
  abandoned: z.number().int().min(0).max(100_000),
  averageLevel: LEVEL.nullable(),
  averageElapsedMs: z.number().min(0).max(600_000).nullable()
})

const AskSchema = z.object({
  question: z.string().trim().min(1).max(ASK_MAX_QUESTION),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(1200) }))
    .max(8)
    .default([]),
  context: z.object({
    week: StatsSchema,
    previousWeek: StatsSchema.nullable(),
    weeklyLevels: z.array(LEVEL).max(52),
    words: z
      .array(
        z.object({
          id: OPAQUE_ID,
          kind: z.enum(['person', 'place', 'object', 'event', 'animal']).nullable(),
          attempts: z.number().int().min(0).max(100_000),
          averageLevel: LEVEL,
          state: z.enum(['unaided', 'one_rung', 'full_ladder']),
          recentLevels: z.array(LEVEL).max(12),
          abandoned: z.number().int().min(0).max(100_000)
        })
      )
      .max(40),
    ladders: z.object({
      model: z.number().int().min(0),
      cache: z.number().int().min(0),
      deterministic: z.number().int().min(0)
    })
  })
})

export class AskDto extends createZodDto(AskSchema) {}
export type AskInput = z.infer<typeof AskSchema>
