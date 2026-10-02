import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HelpAskDto } from './dto/help-ask.dto'
import { HelpService } from './help.service'

@ApiTags('help')
@Controller('help')
export class HelpController {
  constructor(private readonly help: HelpService) {}

  @Post('ask')
  @HttpCode(200)
  ask(@Body() body: HelpAskDto) {
    return this.help.ask(body)
  }
}
