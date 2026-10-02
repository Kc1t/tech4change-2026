'use client'

import { useEffect, useRef, useState } from 'react'
import type { AuditEvent } from './api'
import { eventKey } from './derive'

const FRESH_MS = 2400

export function useFreshKeys(events: AuditEvent[], scope: string | null) {
  const seen = useRef<{ scope: string | null; keys: Set<string> } | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const keys = events.map(eventKey)
    const previous = seen.current
    if (previous && previous.scope === scope && previous.keys.size > 0) {
      const added = keys.filter(key => !previous.keys.has(key))
      if (added.length > 0) setFresh(new Set(added))
    }
    if (keys.length > 0 || previous?.scope !== scope) seen.current = { scope, keys: new Set(keys) }
  }, [events, scope])

  useEffect(() => {
    if (fresh.size === 0) return
    const timer = window.setTimeout(() => setFresh(new Set()), FRESH_MS)
    return () => window.clearTimeout(timer)
  }, [fresh])

  return fresh
}
