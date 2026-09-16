import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ClinicianService } from './clinician.service'

@ApiTags('clinician')
@Controller('clinician')
export class ClinicianController {
  constructor(private readonly clinician: ClinicianService) {}

  @Get(':subject/summary')
  summary(@Param('subject') subject: string) {
    return this.clinician.summary(subject)
  }
}
