import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { OnboardingTurnDto } from './dto/turn.dto'
import { OnboardingService } from './onboarding.service'

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('turn')
  @HttpCode(200)
  turn(@Body() body: OnboardingTurnDto) {
    return this.onboarding.turn(body)
  }
}
