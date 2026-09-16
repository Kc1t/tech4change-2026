import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomInt } from 'crypto'
import { Observable, Subject, defer, filter, map, startWith } from 'rxjs'
import type { JoinSessionInput } from './dto/join-session.dto'
import type { BroadcastCueInput } from './dto/broadcast-cue.dto'

const DEVICE_TTL_MS = 45_000
const SESSION_TTL_MS = 6 * 60 * 60 * 1000
const SWEEP_MS = 15_000

export type DeviceKind = 'phone' | 'watch' | 'earbuds' | 'desktop'

export interface Device {
  id: string
  kind: DeviceKind
  name: string
  joinedAt: number
  seenAt: number
}

interface Session {
  code: string
  createdAt: number
  devices: Map<string, Device>
  channel: Subject<SyncEvent>
}

export type SyncEvent =
  | { type: 'devices'; devices: Device[] }
  | { type: 'cue'; from: string; cue: BroadcastCueInput }
  | { type: 'closed' }

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)
  private readonly sessions = new Map<string, Session>()

  constructor() {
    setInterval(() => this.sweep(), SWEEP_MS).unref()
  }

  create(): { code: string } {
    let code = this.freshCode()
    while (this.sessions.has(code)) code = this.freshCode()

    this.sessions.set(code, {
      code,
      createdAt: Date.now(),
      devices: new Map(),
      channel: new Subject<SyncEvent>()
    })

    this.logger.log(`Session ${code} opened`)
    return { code }
  }

  join(code: string, input: JoinSessionInput): Device {
    const session = this.require(code)
    const device: Device = {
      id: `dev_${randomInt(1e9).toString(36)}`,
      kind: input.kind,
      name: input.name,
      joinedAt: Date.now(),
      seenAt: Date.now()
    }

    session.devices.set(device.id, device)
    this.announce(session)
    return device
  }

  heartbeat(code: string, deviceId: string): Device {
    const session = this.require(code)
    const device = session.devices.get(deviceId)
    if (!device) throw new NotFoundException('device not in session')
    device.seenAt = Date.now()
    return device
  }

  leave(code: string, deviceId: string): void {
    const session = this.sessions.get(code)
    if (!session) return
    if (session.devices.delete(deviceId)) this.announce(session)
  }

  devices(code: string): Device[] {
    return [...this.require(code).devices.values()]
  }

  broadcast(code: string, cue: BroadcastCueInput): { delivered: number } {
    const session = this.require(code)
    session.channel.next({ type: 'cue', from: cue.deviceId, cue })
    return { delivered: session.devices.size }
  }

  stream(code: string): Observable<{ data: SyncEvent }> {
    const session = this.require(code)

    return defer(() =>
      session.channel.pipe(
        startWith<SyncEvent>({ type: 'devices', devices: [...session.devices.values()] })
      )
    ).pipe(
      filter(event => event.type !== 'closed'),
      map(event => ({ data: event }))
    )
  }

  private announce(session: Session): void {
    session.channel.next({ type: 'devices', devices: [...session.devices.values()] })
  }

  private require(code: string): Session {
    const session = this.sessions.get(code)
    if (!session) throw new NotFoundException('session not found')
    return session
  }

  private freshCode(): string {
    return randomInt(1000, 10000).toString()
  }

  private sweep(): void {
    const now = Date.now()

    for (const session of this.sessions.values()) {
      let dropped = false
      for (const device of session.devices.values()) {
        if (now - device.seenAt > DEVICE_TTL_MS) {
          session.devices.delete(device.id)
          dropped = true
        }
      }
      if (dropped) this.announce(session)

      if (now - session.createdAt > SESSION_TTL_MS) {
        session.channel.next({ type: 'closed' })
        session.channel.complete()
        this.sessions.delete(session.code)
        this.logger.log(`Session ${session.code} expired`)
      }
    }
  }
}
