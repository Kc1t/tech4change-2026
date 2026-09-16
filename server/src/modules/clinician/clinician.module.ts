import { Module } from '@nestjs/common'
import { AuditModule } from '../audit/audit.module'
import { ClinicianController } from './clinician.controller'
import { ClinicianService } from './clinician.service'

@Module({
  imports: [AuditModule],
  controllers: [ClinicianController],
  providers: [ClinicianService]
})
export class ClinicianModule {}
