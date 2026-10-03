'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { postDeck, useDeckChannel } from '../deck/channel'
import type { DeckCommand } from '../eilo/deck-schema'

const CODE_PATTERN = /^[a-z0-9-]{6,40}$/i
const PRESS_GAP_MS = 300
const NEXT_KEYS = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter']
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']

type Delivery = 'idle' | 'sending' | 'denied' | 'failed'
type Tone = 'ok' | 'wait' | 'bad'

function readCode(): string | null {
  const code = new URLSearchParams(window.location.search).get('c')
  return code && CODE_PATTERN.test(code) ? code : null
}

function useCode(): string | null | undefined {
  return useSyncExternalStore(() => () => {}, readCode, () => undefined)
}

function statusOf(code: string | null | undefined, delivery: Delivery, online: boolean, deckOnline: boolean): { label: string; tone: Tone } {
  if (code === null || delivery === 'denied') return { label: 'Link inválido: peça um novo', tone: 'bad' }
  if (!online || delivery === 'failed') return { label: 'Sem conexão com o pitch', tone: 'bad' }
  if (!deckOnline) return { label: 'Aguardando o pitch abrir', tone: 'wait' }
  return { label: 'Conectado ao pitch', tone: 'ok' }
}

export function DeckRemote() {
  const code = useCode()
  const [delivery, setDelivery] = useState<Delivery>('idle')
  const lastPress = useRef(0)
  const { state, presence, online } = useDeckChannel({ role: 'remote' })
  const deckOnline = online && (presence?.deck ?? 0) > 0
  const ready = Boolean(code) && delivery !== 'denied'

  const send = useCallback((command: DeckCommand) => {
    if (!code) return
    const now = performance.now()
    if (now - lastPress.current < PRESS_GAP_MS) return
    lastPress.current = now
    if ('vibrate' in navigator) navigator.vibrate(15)
    setDelivery('sending')
    void postDeck({ code, command }).then(result => setDelivery(result === 'denied' ? 'denied' : result === null ? 'failed' : 'idle'))
  }, [code])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      const command: DeckCommand | null = NEXT_KEYS.includes(event.key) ? { action: 'next' } : PREVIOUS_KEYS.includes(event.key) ? { action: 'previous' } : null
      if (!command) return
      event.preventDefault()
      send(command)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [send])

  const status = statusOf(code, delivery, online, deckOnline)

  return (
    <main className="deck-remote">
      <header className="deck-remote__top">
        <img src="/pitch/app/wordmark.png" alt="eilo" />
        <span className={`deck-remote__status deck-remote__status--${status.tone}`} role="status">
          <i />
          {status.label}
        </span>
      </header>

      <section className="deck-remote__now" aria-live="polite">
        <small>{state ? `Slide ${state.index + 1} de ${state.total}` : 'Controle do pitch'}</small>
        <h1>{state?.title ?? 'Esperando o primeiro slide'}</h1>
        <p>{state?.next ? `Depois: ${state.next}` : state ? 'Último slide' : 'Assim que o pitch abrir, o slide atual aparece aqui.'}</p>
      </section>

      <div className="deck-remote__buttons">
        <button type="button" className="deck-remote__previous" disabled={!ready} onClick={() => send({ action: 'previous' })}>
          <ChevronLeft aria-hidden />
          Voltar
        </button>
        <button type="button" className="deck-remote__next" disabled={!ready} onClick={() => send({ action: 'next' })}>
          Avançar
          <ChevronRight aria-hidden />
        </button>
      </div>

      <p className="deck-remote__hint">No computador, as setas e o passador de slides também funcionam.</p>
    </main>
  )
}
