import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ONBOARDING_MAX_ANSWER, ONBOARDING_MAX_MESSAGE } from '../../../common/constants'

export const SEED_SLOTS = ['owner', 'person', 'relation', 'place', 'activity', 'object'] as const

const answer = z.string().trim().max(ONBOARDING_MAX_ANSWER)

const OnboardingTurnSchema = z.object({
  message: z.string().trim().min(1).max(ONBOARDING_MAX_MESSAGE),
  asked: z.string().trim().max(240).default(''),
  known: z.object(Object.fromEntries(SEED_SLOTS.map(slot => [slot, answer.optional()]))).default({})
})

export class OnboardingTurnDto extends createZodDto(OnboardingTurnSchema) {}
export type OnboardingTurnInput = z.infer<typeof OnboardingTurnSchema>
