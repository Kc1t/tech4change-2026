import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ASK_MAX_QUESTION } from '../../../common/constants'

const HelpAskSchema = z.object({
  question: z.string().trim().min(1).max(ASK_MAX_QUESTION),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(1200) }))
    .max(8)
    .default([])
})

export class HelpAskDto extends createZodDto(HelpAskSchema) {}
export type HelpAskInput = z.infer<typeof HelpAskSchema>
