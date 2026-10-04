'use client'

import { useEffect, useRef, useState } from 'react'
import { keepStreaming } from '../eilo/event-stream'
import { parseDeckCommand, parseDeckState, parsePresence, type DeckCommand, type DeckState, type Presence } from '../eilo/deck-schema'

export const DECK_URL = '/pitch/api/deck'

type DeckChannelOptions =
  | { role: 'deck'; onCommand: (command: DeckCommand) => void; session: string; code: string | null }
  | { role: 'remote' | 'phone'; onCommand?: never; session?: never; code?: never }

type DeckPost =
  | { code: string; session: string; state: DeckState; command?: never }
  | { code: string; command: DeckCommand; state?: never; session?: never }

function parseEventData(data: string): unknown {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function useDeckChannel({ role, onCommand, session, code }: DeckChannelOptions) {
  const [state, setState] = useState<DeckState | null>(null)
  const [receivedAt, setReceivedAt] = useState(0)
  const [presence, setPresence] = useState<Presence | null>(null)
  const [online, setOnline] = useState(false)
  const handler = useRef(onCommand)

  useEffect(() => {
    handler.current = onCommand
  }, [onCommand])

  useEffect(() => {
    if (role === 'deck' && (!session || !code)) return
    const params = new URLSearchParams({ role })
    if (session) params.set('session', session)
    if (code) params.set('code', code)
    const close = keepStreaming(`${DECK_URL}?${params}`, source => {
      source.onopen = () => setOnline(true)
      source.onerror = () => setOnline(false)
      source.addEventListener('state', event => {
        const parsed = parseDeckState(parseEventData(event.data))
        if (!parsed) return
        setState(parsed)
        setReceivedAt(Date.now())
      })
      source.addEventListener('presence', event => {
        const parsed = parsePresence(parseEventData(event.data))
        if (parsed) setPresence(parsed)
      })
      source.addEventListener('command', event => {
        const parsed = parseDeckCommand(parseEventData(event.data))
        if (parsed) handler.current?.(parsed)
      })
    })
    return () => {
      close()
      setOnline(false)
    }
  }, [role, session, code])

  return { state, receivedAt, presence, online }
}

export function postDeck(body: DeckPost): Promise<Presence | 'denied' | null> {
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
