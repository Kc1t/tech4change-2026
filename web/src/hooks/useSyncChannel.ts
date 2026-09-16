'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '@/store'
import {
  createSession,
  describeDevice,
  joinSession,
  leaveSession,
  subscribe,
  syncAvailable,
  type DeviceKind
} from '@/sync/client'

let subscribers = 0

export function useSyncChannel(as?: DeviceKind) {
  const owner = useRef(false)
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)
  const devices = useApp(s => s.devices)
  const setSession = useApp(s => s.setSession)
  const setDevices = useApp(s => s.setDevices)
  const setLastCue = useApp(s => s.setLastCue)

  const joining = useRef(false)

  const connect = useCallback(
    async (code: string) => {
      if (joining.current) return false
      joining.current = true
      try {
        const identity = as ? { kind: as, name: as === 'watch' ? 'Relógio' : 'Aparelho' } : describeDevice()
        const device = await joinSession(code, identity)
        if (!device) {
          setSession(null, null)
          return false
        }
        setSession(code, device.id)
        return true
      } finally {
        joining.current = false
      }
    },
    [as, setSession]
  )

  const open = useCallback(async () => {
    const created = await createSession()
    if (!created) return null
    const joined = await connect(created.code)
    return joined ? created.code : null
  }, [connect])

  const close = useCallback(() => {
    if (sessionCode && deviceId) leaveSession(sessionCode, deviceId)
    setSession(null, null)
    setDevices([])
  }, [sessionCode, deviceId, setSession, setDevices])

  useEffect(() => {
    if (!syncAvailable()) return
    if (sessionCode && !deviceId) void connect(sessionCode)
  }, [sessionCode, deviceId, connect])

  useEffect(() => {
    if (!sessionCode || !deviceId) return
    if (!owner.current && subscribers > 0) return
    owner.current = true
    subscribers += 1

    const unsubscribe = subscribe(sessionCode, deviceId, event => {
      if (event.type === 'devices') setDevices(event.devices)
      if (event.type === 'cue' && event.cue.deviceId !== deviceId) setLastCue(event.cue)
    })

    const release = () => leaveSession(sessionCode, deviceId)
    window.addEventListener('pagehide', release)

    return () => {
      unsubscribe()
      window.removeEventListener('pagehide', release)
      owner.current = false
      subscribers -= 1
    }
  }, [sessionCode, deviceId, setDevices, setLastCue])

  return { code: sessionCode, deviceId, devices, open, connect, close, available: syncAvailable() }
}
