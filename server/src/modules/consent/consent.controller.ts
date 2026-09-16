import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ConsentService } from './consent.service'
import { SetConsentDto } from './dto/set-consent.dto'

@ApiTags('consent')
@Controller('consent')
export class ConsentController {
  constructor(private readonly consent: ConsentService) {}

  @Get(':subject')
  get(@Param('subject') subject: string) {
    return this.consent.get(subject)
  }

  @Put(':subject')
  set(@Param('subject') subject: string, @Body() body: SetConsentDto) {
    return this.consent.set(subject, body)
  }
}
