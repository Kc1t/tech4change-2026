'use client'

import { useEffect, useState } from 'react'
import { LIMITS } from './eilo/limits'
import { parseSynced } from './eilo/sync-schema'
import type { Activity, DemoCue, LiveDemoState } from './demo/types'

export const SYNC_URL = '/pitch/api/sync'

export type SyncedDemo = { cue: DemoCue; words: string[]; mic: LiveDemoState['mic']; activity?: Activity; at: number }

const STALE_MS = 12_000

export function vibrationPattern(cue: DemoCue): number[] {
  if (cue.phase === 'success') return [60, 80, 60]
  if (cue.phase === 'given') return [220]
  if (cue.phase !== 'cue') return []
  return Array.from({ length: Math.min(cue.level, 6) + 1 }, () => [90, 110]).flat().slice(0, -1)
}

function roomUrl(): string {
  if (typeof window === 'undefined') return SYNC_URL
  const room = new URLSearchParams(window.location.search).get('sala') ?? ''
  return /^[a-z0-9-]{1,24}$/.test(room) ? `${SYNC_URL}?sala=${room}` : SYNC_URL
}

export function publish(demo: SyncedDemo): Promise<number | null> {
  const body = JSON.stringify({ ...demo, words: demo.words.slice(-LIMITS.syncWords) })
  if (body.length > LIMITS.syncBodyBytes) return Promise.resolve(null)
  return fetch(roomUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
    .then(async response => {
      if (!response.ok) return null
      const data = (await response.json().catch(() => null)) as { listeners?: unknown } | null
      return typeof data?.listeners === 'number' ? data.listeners : 0
    })
    .catch(() => null)
}

export function useRemoteDemo() {
  const [remote, setRemote] = useState<(SyncedDemo & { receivedAt: number }) | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const source = new EventSource(roomUrl())
    source.onmessage = event => {
      try {
        const parsed = parseSynced(JSON.parse(event.data))
        if (!parsed) return
        const receivedAt = Date.now()
        setNow(receivedAt)
        setRemote(current => (current && parsed.at < current.at && receivedAt - current.receivedAt < STALE_MS ? { ...current, receivedAt } : { ...parsed, receivedAt }))
      } catch {}
    }
    const tick = window.setInterval(() => setNow(Date.now()), 2000)
    return () => {
      source.close()
      window.clearInterval(tick)
    }
  }, [])

  const connected = remote !== null && now - remote.receivedAt < STALE_MS
  return { remote: connected ? remote : null, connected }
}

export function usePhoneLink() {
  const [link, setLink] = useState<string | null>(null)
  useEffect(() => {
    fetch(`${SYNC_URL}?info=1`)
      .then(r => r.json())
      .then((data: { phone: unknown }) => setLink(typeof data.phone === 'string' ? data.phone : null))
      .catch(() => {})
  }, [])
  return link
}
