import { Module } from '@nestjs/common'
import { CueModule } from '../modules/cue/cue.module'
import { SttModule } from '../modules/stt/stt.module'
import { TtsModule } from '../modules/tts/tts.module'
import { HealthController } from './health.controller'

@Module({ imports: [CueModule, SttModule, TtsModule], controllers: [HealthController] })
export class HealthModule {}
