'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './use-reduced-motion'

const PHRASE = 'É a minha… a minha…'
const CHAR_MS = 62
const HOLD_MS = 900
const RUNG_MS = 850
const RESET_MS = 2800

const RUNGS = [
  { level: 'degrau 1', text: 'é da família' },
  { level: 'degrau 2', text: 'da geração dos netos' },
  { level: 'degrau 3', text: 'mora em Sorocaba' },
  { level: 'degrau 4', text: 'Le…' }
]

const WORD = 'Letícia'

export function TypingCue() {
  const still = usePrefersReducedMotion()
  const [typed, setTyped] = useState('')
  const [shown, setShown] = useState(0)
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (still) return

    const timers: number[] = []
    let cancelled = false

    function run(reset: boolean) {
      if (cancelled) return
      timers.splice(0).forEach(window.clearTimeout)

      if (reset) {
        setTyped('')
        setShown(0)
        setSolved(false)
      }

      for (let i = 0; i < PHRASE.length; i++) {
        timers.push(window.setTimeout(() => setTyped(PHRASE.slice(0, i + 1)), CHAR_MS * (i + 1)))
      }

      const afterType = CHAR_MS * PHRASE.length + HOLD_MS
      RUNGS.forEach((_, i) => {
        timers.push(window.setTimeout(() => setShown(i + 1), afterType + RUNG_MS * i))
      })

      const afterLadder = afterType + RUNG_MS * RUNGS.length
      timers.push(window.setTimeout(() => setSolved(true), afterLadder))
      timers.push(window.setTimeout(() => run(true), afterLadder + RESET_MS))
    }

    run(false)

    return () => {
      cancelled = true
      timers.forEach(window.clearTimeout)
    }
  }, [still])

  const line = still ? PHRASE : typed
  const rungs = still ? RUNGS.length : shown
  const done = still ? true : solved

  return (
    <div aria-hidden="true" className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center">
      <p className="flex min-h-[3.1rem] items-center rounded-2xl rounded-bl-md bg-white px-5 py-3 text-[1.05rem] leading-snug shadow-[0_10px_30px_-24px_rgba(70,55,120,0.6)]">
        {line}
        {still ? null : (
          <span className="v3-caret ml-[2px] inline-block h-[1.1em] w-[2px] translate-y-[0.14em] bg-[var(--v3-accent)]" />
        )}
      </p>

      <ul className="mt-5 flex w-full flex-col gap-2">
        {RUNGS.map((rung, i) => (
          <li
            key={rung.level}
            className={`flex items-center gap-3 rounded-xl bg-white/70 px-4 py-2 text-left transition-all duration-500 ${
              i < rungs ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            } ${i < rungs - 1 && !done ? 'opacity-45' : ''}`}
          >
            <span className="shrink-0 text-[0.62rem] font-semibold tracking-[0.12em] text-[var(--v3-accent)] uppercase">
              {rung.level}
            </span>
            <span className="text-[0.88rem] leading-snug">{rung.text}</span>
          </li>
        ))}
      </ul>

      <p
        className={`mt-6 text-[2.1rem] leading-none font-medium tracking-[-0.035em] text-[var(--v3-accent)] transition-all duration-500 ${
          done ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {WORD}
      </p>
    </div>
  )
}
