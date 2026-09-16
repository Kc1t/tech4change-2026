import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuditService } from './audit.service'
import { RecordEventDto } from './dto/record-event.dto'

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Post('events')
  record(@Body() body: RecordEventDto) {
    return this.audit.record(body)
  }

  @Get('events/:subject')
  list(@Param('subject') subject: string) {
    return this.audit.listBySubject(subject)
  }
}
