import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const JoinSessionSchema = z.object({
  kind: z.enum(['phone', 'watch', 'earbuds', 'desktop']),
  name: z.string().min(1).max(32).regex(/^[\p{L}\p{N} ._-]+$/u, 'name must be a plain device label')
})

export class JoinSessionDto extends createZodDto(JoinSessionSchema) {}
export type JoinSessionInput = z.infer<typeof JoinSessionSchema>
