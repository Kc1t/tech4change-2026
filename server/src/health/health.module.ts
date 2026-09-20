import { Module } from '@nestjs/common'
import { CueModule } from '../modules/cue/cue.module'
import { HealthController } from './health.controller'

@Module({ imports: [CueModule], controllers: [HealthController] })
export class HealthModule {}
