import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const OPAQUE_ID = z.string().min(1).max(64).regex(/^[a-z0-9][a-z0-9_:-]*$/)

const BroadcastCueSchema = z.object({
  deviceId: z.string().min(1).max(64),
  targetId: OPAQUE_ID,
  level: z.number().int().min(0).max(12),
  attr: z.string().min(1).max(32).regex(/^[a-z][a-z0-9_]*$/),
  edge: OPAQUE_ID.nullable(),
  isFinal: z.boolean(),
  event: z.enum(['cue', 'resolved'])
})

export class BroadcastCueDto extends createZodDto(BroadcastCueSchema) {}
export type BroadcastCueInput = z.infer<typeof BroadcastCueSchema>
