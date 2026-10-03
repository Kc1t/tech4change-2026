'use client'

import { useEffect, useRef, useState } from 'react'
import type { DeckCommand } from '../eilo/deck-schema'
import { DECK_URL, postDeck, useDeckChannel } from './channel'
import { SLIDES } from './slides'

const HEARTBEAT_MS = 5000
const INFO_REFRESH_MS = 15_000

export type RemoteLinks = { code: string; lan: string | null; public: string | null }

export type DeckActions = { next: () => void; previous: () => void; go: (index: number) => void }

function parseLinks(value: unknown): RemoteLinks | null {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : null
  if (!raw || typeof raw.code !== 'string') return null
  const url = (field: unknown) => (typeof field === 'string' && /^https?:\/\//.test(field) ? field : null)
  return { code: raw.code, lan: url(raw.lan), public: url(raw.public) }
}

function sameLinks(a: RemoteLinks | null, b: RemoteLinks | null): boolean {
  return a?.code === b?.code && a?.lan === b?.lan && a?.public === b?.public
}

function stateAt(index: number) {
  const slide = SLIDES[index]
  return { index, total: SLIDES.length, title: slide.name, next: SLIDES[index + 1]?.name ?? null, listen: Boolean(slide.listens), at: Date.now() }
}

export function useDeckLink(index: number, actions: DeckActions) {
  const [session] = useState(() => crypto.randomUUID())
  const [links, setLinks] = useState<RemoteLinks | null>(null)
  const code = links?.code ?? null
  const act = useRef(actions)

  useEffect(() => {
    act.current = actions
  }, [actions])

  const { presence } = useDeckChannel('deck', (command: DeckCommand) => {
    if (command.action === 'next') act.current.next()
    else if (command.action === 'previous') act.current.previous()
    else act.current.go(command.index)
  }, session, code)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      fetch(`${DECK_URL}?info=1`)
        .then(response => (response.ok ? response.json() : null))
        .then(data => {
          if (cancelled) return
          const loaded = parseLinks(data)
          setLinks(current => (sameLinks(current, loaded) ? current : loaded))
        })
        .catch(() => {})
    void load()
    const timer = window.setInterval(load, INFO_REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!code) return
    const send = () => void postDeck({ code, session, state: stateAt(index) })
    send()
    const beat = window.setInterval(send, HEARTBEAT_MS)
    return () => window.clearInterval(beat)
  }, [code, index, session])

  return { links, remotes: presence?.remote ?? 0 }
}
