'use client'

import { useState } from 'react'
import { Mic, RotateCcw } from 'lucide-react'
import { Logo } from '@/components/v3/logo'
import { Orb } from '@/components/v3/orb'
import { AuroraField } from './aurora-field'
import { BackdropToggle, type Backdrop } from './backdrop-toggle'

export type Rung = { level: number; kind: string; text: string }
export type Mode = 'hint' | 'ladder'

const MODES: Array<{ value: Mode; label: string; hint: string }> = [
  { value: 'hint', label: 'Dica', hint: 'só o último degrau' },
  { value: 'ladder', label: 'Escada', hint: 'do primeiro ao último' }
]

export function DeskListener({
  prompt,
  answer,
  mode,
  onMode,
  rungs,
  level,
  resolvedAt,
  onAdvance,
  onSucceed,
  onReset
}: {
  prompt: string
  answer: string
  mode: Mode
  onMode: (mode: Mode) => void
  rungs: Rung[]
  level: number
  resolvedAt: number | null
  onAdvance: () => void
  onSucceed: () => void
  onReset: () => void
}) {
  const [backdrop, setBackdrop] = useState<Backdrop>('wave')
  const resolved = resolvedAt !== null
  const open = level > 0
  const step = rungs[level - 1]
  const last = level >= rungs.length

  const status = resolved
    ? 'Destravou'
    : open
      ? `Degrau ${level} de ${rungs.length}`
      : 'Escutando a conversa'
  const label = resolved ? 'A palavra' : open ? `O degrau · ${step?.kind}` : 'Esperando a palavra'
  const headline = resolved ? answer : step ? step.text : 'É a… a…'

  return (
    <div className="v3-glass relative h-full overflow-hidden rounded-[1.75rem]">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[38%] transition-opacity duration-500 ${
          backdrop === 'wave' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <AuroraField
          state={resolved ? 'delivering' : open ? 'searching' : 'listening'}
          className="size-full"
        />
      </span>

      <div className="relative flex h-full flex-col px-8 py-7 sm:px-10">
        <header className="flex items-start justify-between gap-4">
          <Logo className="h-8" />
          <div className="flex items-center gap-3">
            <BackdropToggle backdrop={backdrop} onBackdrop={setBackdrop} />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e9e2fa] px-4 py-2 text-[0.86rem] font-medium text-[var(--v3-accent-deep)]">
              <Mic className="size-4 text-[var(--v3-accent)]" />
              {status}
            </span>
          </div>
        </header>

        <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
          {prompt}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <span
            aria-hidden="true"
            className={`block w-[200px] shrink-0 overflow-hidden transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              backdrop === 'orb' ? 'mb-7 max-h-[200px] opacity-100' : 'mb-0 max-h-0 opacity-0'
            }`}
          >
            <Orb
              rings={false}
              className="mx-auto my-3 w-[176px] rounded-full ring-1 ring-[var(--v3-lilac)]"
            />
          </span>

          <div aria-live="polite" aria-atomic="true" className="flex flex-col items-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
              {label}
            </p>
            <p
              className={`mt-5 max-w-xl text-[clamp(2.1rem,3.8vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance ${
                resolved
                  ? 'text-[var(--v3-accent)]'
                  : open
                    ? 'text-[var(--v3-ink)]'
                    : 'text-[#9a95a8]'
              }`}
            >
              {headline}
            </p>
          </div>

          <div className="mt-11 flex flex-col items-center gap-3">
            {resolved ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-13 items-center gap-2 rounded-xl border border-[var(--v3-line)] bg-white px-7 text-[0.95rem] font-medium text-[var(--v3-ink)] transition-colors hover:border-[var(--v3-accent)]"
              >
                <RotateCcw className="size-4 text-[var(--v3-accent)]" />
                Ver de novo
              </button>
            ) : (
              <button
                type="button"
                onClick={last ? onSucceed : onAdvance}
                className="v3-dark-btn inline-flex h-13 items-center rounded-xl px-8 text-[0.98rem] font-medium text-white"
              >
                {last ? 'Consegui dizer' : open ? 'Ainda não veio' : 'A palavra não vem'}
              </button>
            )}

            {open && !resolved && !last ? (
              <button
                type="button"
                onClick={onSucceed}
                className="text-[0.88rem] font-semibold text-[var(--v3-accent)] underline-offset-4 hover:underline"
              >
                Consegui dizer
              </button>
            ) : (
              <p className="max-w-xs text-center text-[0.84rem] leading-relaxed text-[var(--v3-muted)]">
                {resolved
                  ? `Saiu no degrau ${resolvedAt}.`
                  : last
                    ? 'Último degrau. O som do começo é o que costuma destravar.'
                    : 'Toque quando a palavra travar.'}
              </p>
            )}
          </div>
        </div>

        <footer className="-mx-8 -mb-7 flex flex-wrap items-center justify-between gap-4 rounded-b-[1.75rem] border-t border-white/70 bg-white/60 px-8 pt-6 pb-7 backdrop-blur-[3px] sm:-mx-10 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="text-[0.82rem] text-[var(--v3-accent-deep)]">Quanta ajuda:</span>
            <div className="flex gap-2">
              {MODES.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onMode(item.value)}
                  title={item.hint}
                  className={`rounded-full border bg-white px-5 py-2 text-[0.84rem] font-medium transition-colors ${
                    mode === item.value
                      ? 'border-[var(--v3-accent)] text-[var(--v3-ink)] shadow-[0_4px_14px_-8px_rgba(70,55,120,0.8)]'
                      : 'border-[var(--v3-line)] text-[var(--v3-muted)] hover:text-[var(--v3-ink)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="flex gap-2">
            {rungs.map(rung => (
              <i
                key={rung.level}
                className={`block size-2.5 rounded-full transition-colors duration-500 ${
                  rung.level <= level ? 'bg-[var(--v3-accent)]' : 'bg-white/80 ring-1 ring-[var(--v3-line)]'
                }`}
              />
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
