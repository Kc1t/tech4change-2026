import { Body, Controller, Delete, Get, Param, Post, Sse } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BroadcastCueDto } from './dto/broadcast-cue.dto'
import { JoinSessionDto } from './dto/join-session.dto'
import { SyncService } from './sync.service'

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('sessions')
  create() {
    return this.sync.create()
  }

  @Get('sessions/:code/devices')
  devices(@Param('code') code: string) {
    return this.sync.devices(code)
  }

  @Post('sessions/:code/devices')
  join(@Param('code') code: string, @Body() body: JoinSessionDto) {
    return this.sync.join(code, body)
  }

  @Post('sessions/:code/devices/:deviceId/heartbeat')
  heartbeat(@Param('code') code: string, @Param('deviceId') deviceId: string) {
    return this.sync.heartbeat(code, deviceId)
  }

  @Delete('sessions/:code/devices/:deviceId')
  leave(@Param('code') code: string, @Param('deviceId') deviceId: string) {
    this.sync.leave(code, deviceId)
    return { left: true }
  }

  @Post('sessions/:code/cue')
  broadcast(@Param('code') code: string, @Body() body: BroadcastCueDto) {
    return this.sync.broadcast(code, body)
  }

  @Sse('sessions/:code/stream')
  stream(@Param('code') code: string) {
    return this.sync.stream(code)
  }
}
