import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AskService } from './ask.service'
import { ClinicianService } from './clinician.service'
import { AskDto } from './dto/ask.dto'

@ApiTags('clinician')
@Controller('clinician')
export class ClinicianController {
  constructor(
    private readonly clinician: ClinicianService,
    private readonly assistant: AskService
  ) {}

  @Get('subjects')
  subjects() {
    return this.clinician.subjects()
  }

  @Post('ask')
  @HttpCode(200)
  ask(@Body() body: AskDto) {
    return this.assistant.ask(body)
  }

  @Get(':subject/summary')
  summary(@Param('subject') subject: string) {
    return this.clinician.summary(subject)
  }
}
