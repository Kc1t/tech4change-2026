'use client'

import { useEffect, useRef, useState } from 'react'
import { parseDeckCommand, parseDeckState, parsePresence, type DeckCommand, type DeckState, type Presence } from '../eilo/deck-schema'

export const DECK_URL = '/pitch/api/deck'

export type DeckRole = keyof Presence

function json(data: string): unknown {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function useDeckChannel(role: DeckRole, onCommand?: (command: DeckCommand) => void, session?: string, code?: string | null) {
  const [state, setState] = useState<DeckState | null>(null)
  const [receivedAt, setReceivedAt] = useState(0)
  const [presence, setPresence] = useState<Presence | null>(null)
  const [online, setOnline] = useState(false)
  const handler = useRef(onCommand)

  useEffect(() => {
    handler.current = onCommand
  }, [onCommand])

  useEffect(() => {
    if (role === 'deck' && !code) return
    const source = new EventSource(`${DECK_URL}?role=${role}${session ? `&session=${encodeURIComponent(session)}` : ''}${code ? `&code=${encodeURIComponent(code)}` : ''}`)
    source.onopen = () => setOnline(true)
    source.onerror = () => setOnline(false)
    source.addEventListener('state', event => {
      const parsed = parseDeckState(json(event.data))
      if (!parsed) return
      setState(parsed)
      setReceivedAt(Date.now())
    })
    source.addEventListener('presence', event => {
      const parsed = parsePresence(json(event.data))
      if (parsed) setPresence(parsed)
    })
    source.addEventListener('command', event => {
      const parsed = parseDeckCommand(json(event.data))
      if (parsed) handler.current?.(parsed)
    })
    return () => source.close()
  }, [role, session, code])

  return { state, receivedAt, presence, online }
}

export function postDeck(body: { code: string; session?: string; state?: DeckState; command?: DeckCommand }): Promise<Presence | 'denied' | null> {
  return fetch(DECK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
    body: JSON.stringify(body),
    keepalive: true
  })
    .then(async response => {
      if (response.status === 403) return 'denied' as const
      return response.ok ? parsePresence(await response.json().catch(() => null)) : null
    })
    .catch(() => null)
}
