'use client'

import { Logo } from '@/components/v3/logo'
import { Orb } from '@/components/v3/orb'

export type Rung = { level: number; kind: string; text: string }
export type Mode = 'hint' | 'ladder'

const MODES: Array<{ value: Mode; label: string }> = [
  { value: 'hint', label: 'Dica' },
  { value: 'ladder', label: 'Escada' }
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
  const resolved = resolvedAt !== null
  const open = level > 0
  const step = rungs[level - 1]

  const status = resolved
    ? 'destravou'
    : open
      ? `degrau ${level} de ${rungs.length}`
      : 'escuta ligada'

  const label = resolved ? 'a palavra' : step ? `degrau ${step.level} · ${step.kind}` : 'esperando a palavra'
  const expected = resolved ? answer : step ? step.text : 'é a minha… a minha…'

  const caption = resolved
    ? `Em ${resolvedAt} ${resolvedAt === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa mais longe.`
    : open
      ? 'Toque de novo se ainda não vier.'
      : 'Toque quando a palavra não vier.'

  return (
    <div className="relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-[1.5rem] border border-[var(--v3-line)] bg-white px-7 py-7 shadow-[0_24px_60px_-40px_rgba(70,55,120,0.6)] sm:px-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[min(560px,105%)] -translate-x-1/2 -translate-y-1/2 opacity-[0.22] blur-[2px]"
      >
        <Orb rings={false} className="w-full" />
      </div>

      <header className="flex items-center justify-between gap-4">
        <Logo className="h-6" />
        <div className="flex gap-1 rounded-full bg-[#f2f0f8] p-1">
          {MODES.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => onMode(item.value)}
              className={`rounded-full px-4 py-1.5 text-[0.78rem] font-medium transition-colors ${
                mode === item.value
                  ? 'bg-white text-[var(--v3-ink)] shadow-[0_2px_8px_-4px_rgba(70,55,120,0.6)]'
                  : 'text-[var(--v3-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <p className="mt-8 text-[0.66rem] font-semibold tracking-[0.16em] text-[var(--v3-accent)] uppercase">
        {status}
      </p>
      <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
        {prompt}
      </p>

      <button
        type="button"
        onClick={resolved ? onReset : onAdvance}
        className="group my-auto flex w-full flex-col items-center px-2 py-10 text-center"
      >
        <span className="text-[0.66rem] font-semibold tracking-[0.16em] text-[var(--v3-faint,#9a93a8)] uppercase">
          {label}
        </span>

        <span
          className={`mt-4 text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.1] font-medium tracking-[-0.04em] text-balance transition-colors ${
            resolved
              ? 'text-[var(--v3-accent)]'
              : open
                ? 'text-[var(--v3-ink)]'
                : 'text-[#b6b0c6]'
          }`}
        >
          {expected}
        </span>

        <span className="mt-5 max-w-xs text-[0.88rem] leading-relaxed text-[var(--v3-muted)] group-hover:text-[var(--v3-ink)]">
          {caption}
        </span>
      </button>

      <footer className="flex flex-col items-center gap-5">
        {open && !resolved ? (
          <button
            type="button"
            onClick={onSucceed}
            className="rounded-xl border border-[var(--v3-line)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-ink)]"
          >
            Consegui
          </button>
        ) : null}

        {resolved ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-[var(--v3-line)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-ink)]"
          >
            Ver de novo
          </button>
        ) : null}

        <div aria-hidden="true" className="flex gap-2">
          {rungs.map(rung => (
            <i
              key={rung.level}
              className={`block size-2 rounded-full transition-colors duration-500 ${
                rung.level <= level ? 'bg-[var(--v3-accent)]' : 'bg-[var(--v3-line)]'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  )
}
