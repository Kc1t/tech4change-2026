import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const SetConsentSchema = z.object({
  listening: z.boolean(),
  photos: z.boolean(),
  clinician: z.boolean(),
  research: z.boolean()
})

export class SetConsentDto extends createZodDto(SetConsentSchema) {}
export type SetConsentInput = z.infer<typeof SetConsentSchema>
