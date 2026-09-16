import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CueService } from './cue.service'
import { RankCueDto } from './dto/rank-cue.dto'

@ApiTags('cue')
@Controller('cue')
export class CueController {
  constructor(private readonly cue: CueService) {}

  @Post('rank')
  rank(@Body() body: RankCueDto) {
    return this.cue.rank(body)
  }
}
