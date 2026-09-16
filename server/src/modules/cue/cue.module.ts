import { Module } from '@nestjs/common'
import { CandidatesService } from './candidates.service'
import { CueController } from './cue.controller'
import { CueService } from './cue.service'
import { RerankService } from './rerank.service'

@Module({
  controllers: [CueController],
  providers: [CueService, CandidatesService, RerankService],
  exports: [CueService]
})
export class CueModule {}
