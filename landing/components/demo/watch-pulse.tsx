'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Smartphone, Vibrate } from 'lucide-react'
import { stressIndex, syllables } from '@/lib/phonology'

const WEAK = 130
const STRONG = 320
const GAP = 170

export function WatchPulse({ word, ready }: { word: string; ready: boolean }) {
  const parts = useMemo(() => syllables(word), [word])
  const strong = useMemo(() => stressIndex(word), [word])
  const [active, setActive] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const stop = useCallback(() => {
    timers.current.forEach(id => window.clearTimeout(id))
    timers.current = []
    setActive(null)
  }, [])

  const play = useCallback(() => {
    stop()
    const pattern: number[] = []
    let at = 0

    parts.forEach((_, i) => {
      const hold = i === strong ? STRONG : WEAK
      timers.current.push(window.setTimeout(() => setActive(i), at))
      timers.current.push(window.setTimeout(() => setActive(null), at + hold))
      pattern.push(hold, GAP)
      at += hold + GAP
    })

    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }, [parts, strong, stop])

  useEffect(() => stop, [stop])

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(play, 520)
    return () => window.clearTimeout(id)
  }, [ready, play])

  return (
    <section className="v3-glass flex flex-col rounded-[1.5rem] px-7 py-6">
      <header className="flex items-center justify-between gap-4">
        <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--v3-accent-deep)] uppercase">
          No relógio
        </p>
        <p className="text-[0.72rem] text-[#b6b0c6]">relógio simulado</p>
      </header>

      <div className="mt-5 flex items-center gap-7">
        <div className="relative h-[178px] w-[122px] shrink-0">
          <span
            aria-hidden="true"
            className="absolute inset-x-[27px] top-0 h-[66px] rounded-t-[13px] bg-[linear-gradient(180deg,#453f59,#2c2839)]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-[27px] bottom-0 h-[66px] rounded-b-[13px] bg-[linear-gradient(0deg,#453f59,#2c2839)]"
          />

          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--v3-accent)] opacity-[0.16]"
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-[178px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--v3-accent)] opacity-[0.09]"
            />

            {active !== null ? (
              <span
                key={active}
                aria-hidden="true"
                className="v3-ring absolute top-1/2 left-1/2 size-[118px] rounded-full border-2 border-[var(--v3-accent)]"
              />
            ) : null}

            <span className={`block ${active !== null ? 'v3-buzz' : ''}`}>
              <span className="block size-[118px] rounded-full bg-[linear-gradient(150deg,#494263,#1e1c28)] p-[6px] shadow-[0_18px_36px_-18px_rgba(40,30,70,0.8)]">
                <span className="grid size-full place-items-center rounded-full bg-[linear-gradient(170deg,#fbfaff,#e9e4f7)]">
                  <img
                    src="/brand/icon.webp"
                    alt=""
                    aria-hidden="true"
                    className={`size-8 transition-transform duration-150 ${
                      active !== null ? 'scale-110' : ''
                    }`}
                  />
                </span>
              </span>
            </span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
            Se tivesse um relógio vinculado, ele vibraria assim.
          </p>

          {ready ? (
            <div className="mt-4 flex flex-wrap items-end gap-1.5" aria-hidden="true">
              {parts.map((part, i) => (
                <span
                  key={`${part}-${i}`}
                  className={`rounded-lg text-center text-[0.86rem] leading-none font-medium transition-all duration-150 ${
                    i === strong ? 'px-4 py-3' : 'px-2.5 py-2'
                  } ${
                    active === i
                      ? 'bg-[var(--v3-accent)] text-white'
                      : 'bg-[#efeafb] text-[var(--v3-accent-deep)]'
                  }`}
                >
                  {part}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-white/60 px-4 py-3 text-[0.84rem] leading-relaxed text-[#8f8aa0]">
              O compasso aparece quando a palavra for alcançada.
            </p>
          )}

          <p className="mt-2.5 rounded-xl bg-white/60 px-4 py-3 text-[0.8rem] leading-relaxed text-[#8f8aa0]">
            Um pulso por sílaba, o longo na sílaba forte. Ninguém precisa olhar a tela.
          </p>

          {ready ? (
            <button
              type="button"
              onClick={play}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--v3-accent)] bg-white px-5 text-[0.88rem] font-medium text-[var(--v3-ink)] transition-colors hover:bg-[#faf9ff]"
            >
              <Vibrate className="size-4 text-[var(--v3-accent)]" />
              Sentir de novo
            </button>
          ) : null}

          <a
            href="/#baixar"
            className="mt-2.5 flex h-11 items-center gap-2 rounded-xl border border-[var(--v3-line)] bg-white px-4 text-[0.88rem] font-medium text-[var(--v3-ink)] transition-colors hover:border-[var(--v3-accent)]"
          >
            <Smartphone className="size-4 text-[var(--v3-accent)]" />
            <span className="flex-1">Levar para o aparelho</span>
            <ChevronRight className="size-4 text-[#b6b0c6]" />
          </a>
        </div>
      </div>
    </section>
  )
}
