import { Module } from '@nestjs/common'
import { SttGateway } from './stt.gateway'

@Module({ providers: [SttGateway], exports: [SttGateway] })
export class SttModule {}
