import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'
import { AuditModule } from './modules/audit/audit.module'
import { ClinicianModule } from './modules/clinician/clinician.module'
import { ConsentModule } from './modules/consent/consent.module'
import { CueModule } from './modules/cue/cue.module'
import { SyncModule } from './modules/sync/sync.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 240 }]),
    DatabaseModule,
    CueModule,
    AuditModule,
    ClinicianModule,
    ConsentModule,
    SyncModule,
    HealthModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
