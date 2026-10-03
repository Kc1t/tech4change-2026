'use client'

import { useEffect, useState } from 'react'
import { useDeckChannel } from '../deck/channel'

const STALE_MS = 60_000
const CHECK_MS = 5000

export function useDeckGate() {
  const { state, receivedAt } = useDeckChannel({ role: 'phone' })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), CHECK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const fresh = state !== null && now - receivedAt < STALE_MS
  return { open: state === null || !fresh || state.listen }
}
