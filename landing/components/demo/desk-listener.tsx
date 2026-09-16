'use client'

import { Mic, RotateCcw } from 'lucide-react'
import { Logo } from '@/components/v3/logo'

export type Rung = { level: number; kind: string; text: string }
export type Mode = 'hint' | 'ladder'

const MODES: Array<{ value: Mode; label: string; hint: string }> = [
  { value: 'hint', label: 'Dica', hint: 'entrega um degrau só' },
  { value: 'ladder', label: 'Escada', hint: 'sobe degrau a degrau' }
]

export function DeskListener({
  owner,
  answer,
  status,
  mode,
  onMode,
  rungs,
  shown,
  resolved,
  armed,
  onArm,
  onReset
}: {
  owner: string
  answer: string
  status: string
  mode: Mode
  onMode: (mode: Mode) => void
  rungs: Rung[]
  shown: number
  resolved: boolean
  armed: boolean
  onArm: () => void
  onReset: () => void
}) {
  const active = MODES.find(item => item.value === mode)

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--v3-line)] bg-white shadow-[0_24px_60px_-40px_rgba(70,55,120,0.6)]">
      <header className="flex flex-wrap items-center gap-4 border-b border-[var(--v3-line)] px-7 py-5">
        <Logo className="h-7" />
        <span className="text-[0.82rem] text-[var(--v3-muted)]">domingo, 11h04</span>

        <span className="ml-auto flex items-center gap-2 text-[0.78rem] font-medium text-[var(--v3-accent)]">
          <i className="block size-1.5 animate-pulse rounded-full bg-[var(--v3-accent)]" />
          {status}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full bg-[#f2f0f8] p-1">
            {MODES.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => onMode(item.value)}
                className={`rounded-full px-4 py-1.5 text-[0.8rem] font-medium transition-colors ${
                  mode === item.value
                    ? 'bg-white text-[var(--v3-ink)] shadow-[0_2px_8px_-4px_rgba(70,55,120,0.6)]'
                    : 'text-[var(--v3-muted)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="hidden text-[0.76rem] text-[var(--v3-muted)] sm:block">
            {active?.hint}
          </span>
        </div>
      </header>

      <div className="px-7 py-8 sm:px-9">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-[var(--v3-muted)] uppercase">
          {owner}
        </p>
        <p className="mt-2 max-w-md rounded-2xl rounded-bl-md bg-[#f4f2fb] px-5 py-4 text-[1.15rem] leading-snug">
          É a minha… a minha…
        </p>

        <div className="mt-7 min-h-[268px]">
          {resolved ? (
            <div className="flex h-full flex-col justify-center rounded-[1.25rem] bg-[linear-gradient(160deg,#6b5fa8,#443c63)] px-7 py-8 text-white">
              <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-white/60 uppercase">
                quem disse a palavra foi você
              </p>
              <p className="mt-2 text-[clamp(2.4rem,5vw,3.4rem)] leading-none font-medium tracking-[-0.04em]">
                {answer}
              </p>
              <p className="mt-4 max-w-sm text-[0.92rem] leading-relaxed text-white/70">
                Em {shown} {shown === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica já começa no
                degrau {Math.max(1, shown - 1)}.
              </p>
            </div>
          ) : (
            <ol className="grid gap-3 sm:grid-cols-2">
              {rungs.map((rung, i) => {
                const visible = i < shown
                return (
                  <li
                    key={rung.level}
                    className={`rounded-[1.1rem] border px-5 py-4 transition-all duration-500 ${
                      visible
                        ? 'border-[var(--v3-line)] bg-[#f7f6fb] opacity-100'
                        : 'border-dashed border-[var(--v3-line)] bg-transparent opacity-45'
                    }`}
                  >
                    <p className="text-[0.66rem] font-semibold tracking-[0.12em] text-[var(--v3-accent)] uppercase">
                      degrau {rung.level} · {rung.kind}
                    </p>
                    <p className="mt-1.5 text-[1.02rem] leading-snug">
                      {visible ? rung.text : '—'}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {resolved ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[var(--v3-line)] px-6 py-3 text-[0.88rem] font-medium text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-ink)]"
          >
            <RotateCcw className="size-4" />
            Ver de novo
          </button>
        ) : (
          <button
            type="button"
            onClick={onArm}
            disabled={armed}
            className={`v3-dark-btn mt-7 inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[0.95rem] font-medium text-white ${
              armed ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <Mic className="size-4" />
            {armed ? 'Procurando o caminho…' : 'Travou'}
          </button>
        )}
      </div>
    </div>
  )
}
