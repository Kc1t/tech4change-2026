import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const JoinSessionSchema = z.object({
  kind: z.enum(['phone', 'watch', 'earbuds', 'desktop']),
  name: z.string().min(1).max(32).regex(/^[\p{L}\p{N} ._-]+$/u, 'name must be a plain device label'),
  battery: z.number().int().min(0).max(100).nullable().optional()
})

const HeartbeatSchema = z.object({
  battery: z.number().int().min(0).max(100).nullable().optional()
})

export class JoinSessionDto extends createZodDto(JoinSessionSchema) {}
export type JoinSessionInput = z.infer<typeof JoinSessionSchema>

export class HeartbeatDto extends createZodDto(HeartbeatSchema) {}
export type HeartbeatInput = z.infer<typeof HeartbeatSchema>
