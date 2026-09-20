import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '../store'
import {
  createSession,
  describeDevice,
  discoverSession,
  heartbeat,
  joinSession,
  leaveSession,
  pollEvents
} from '../sync/client'

const POLL_MS = 900
const HEARTBEAT_MS = 20_000

let pollers = 0

export function useSyncChannel() {
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)
  const devices = useApp(s => s.devices)
  const setSession = useApp(s => s.setSession)
  const setDevices = useApp(s => s.setDevices)
  const setLastCue = useApp(s => s.setLastCue)

  const joining = useRef(false)
  const owner = useRef(false)

  const connect = useCallback(
    async (code: string) => {
      if (joining.current) return false
      joining.current = true
      try {
        const device = await joinSession(code, describeDevice())
        if (!device) return false
        setSession(code, device.id)
        return true
      } finally {
        joining.current = false
      }
    },
    [setSession]
  )

  const open = useCallback(async () => {
    const waiting = await discoverSession()
    if (waiting && (await connect(waiting))) return waiting

    const created = await createSession()
    if (!created) return null
    return (await connect(created.code)) ? created.code : null
  }, [connect])

  const close = useCallback(() => {
    if (sessionCode && deviceId) leaveSession(sessionCode, deviceId)
    setSession(null, null)
    setDevices([])
  }, [sessionCode, deviceId, setSession, setDevices])

  useEffect(() => {
    if (!sessionCode || !deviceId) return
    if (!owner.current && pollers > 0) return
    owner.current = true
    pollers += 1

    let cursor = 0
    let alive = true
    let primed = false

    const tick = async () => {
      const page = await pollEvents(sessionCode, cursor)
      if (!alive || !page) return
      cursor = page.seq

      for (const event of page.events) {
        if (event.type === 'devices') setDevices(event.devices)
        if (event.type === 'closed') setSession(null, null)
        if (event.type === 'cue' && primed && event.cue.deviceId !== deviceId) {
          setLastCue(event.cue)
        }
      }

      primed = true
    }

    void tick()
    const poll = setInterval(() => void tick(), POLL_MS)
    const beat = setInterval(() => heartbeat(sessionCode, deviceId), HEARTBEAT_MS)

    return () => {
      alive = false
      clearInterval(poll)
      clearInterval(beat)
      owner.current = false
      pollers -= 1
    }
  }, [sessionCode, deviceId, setDevices, setLastCue, setSession])

  return { code: sessionCode, deviceId, devices, open, connect, close }
}
