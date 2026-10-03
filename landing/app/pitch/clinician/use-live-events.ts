'use client'

import { useEffect, useRef, useState } from 'react'
import { useRemoteDemo } from '../sync'
import type { FeedEvent } from './data'

const MAX_LEVEL = 4

function clock() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function useLiveEvents() {
  const { remote, connected } = useRemoteDemo()
  const [events, setEvents] = useState<FeedEvent[]>([])
  const seen = useRef<string | null>(null)
  const blockAt = useRef<number | null>(null)

  useEffect(() => {
    if (!remote) return
    const { cue } = remote
    const signature = `${cue.phase}|${cue.level}|${cue.text}`
    if (signature === seen.current) return
    seen.current = signature
    if (cue.phase === 'cue' && blockAt.current == null) blockAt.current = remote.at
    if (cue.phase === 'idle') blockAt.current = null
    if (cue.phase !== 'success' && cue.phase !== 'given') return

    const started = blockAt.current ?? remote.at
    blockAt.current = null
    const base = { day: 'now', time: clock(), word: cue.text, channel: 'watch', live: true } as const
    const outcome: FeedEvent =
      cue.phase === 'success'
        ? { ...base, key: `live-r-${remote.at}`, kind: 'resolved', level: Math.min(MAX_LEVEL, cue.level + 1), seconds: Math.max(1, (remote.at - started) / 1000) }
        : { ...base, key: `live-g-${remote.at}`, kind: 'given', level: MAX_LEVEL }
    const block: FeedEvent = { ...base, key: `live-b-${remote.at}`, kind: 'block', level: 0 }
    setEvents(previous => [outcome, block, ...previous])
  }, [remote])

  return { events, connected }
}
