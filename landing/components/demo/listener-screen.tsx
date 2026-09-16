'use client'

import { RotateCcw } from 'lucide-react'

export type Rung = { level: number; kind: string; text: string }
export type Mode = 'hint' | 'ladder'

const MODES: Array<{ value: Mode; label: string; hint: string }> = [
  { value: 'hint', label: 'Dica', hint: 'entrega um degrau só' },
  { value: 'ladder', label: 'Escada', hint: 'sobe degrau a degrau' }
]

export function ListenerScreen({
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
    <div className="flex h-full flex-col bg-ink px-4 pt-8 pb-4 text-fg">
      <div className="flex items-center justify-between">
        <span className="label-caps">domingo, 11h04</span>
        <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold text-faint">
          <i className="block size-1.5 animate-pulse rounded-full bg-mastery-low" />
          {status}
        </span>
      </div>

      <div className="mt-3 flex gap-1 rounded-full border border-line-soft p-0.5">
        {MODES.map(item => (
          <button
            key={item.value}
            type="button"
            onClick={() => onMode(item.value)}
            className={`flex-1 rounded-full py-1.5 text-[0.72rem] font-semibold transition-colors ${
              mode === item.value ? 'bg-fg text-ink' : 'text-faint'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="label-caps mt-1.5 text-center">{active?.hint}</p>

      <p className="mt-3 rounded-2xl rounded-bl-sm border border-line-soft px-3 py-2 text-[0.88rem] leading-snug">
        <span className="label-caps mb-0.5 block">{owner}</span>
        É a minha… a minha…
      </p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,#000_14%)]">
        {resolved ? (
          <div>
            <span className="label-caps">quem disse a palavra foi você</span>
            <p className="display mt-1 text-[2.1rem] leading-none text-primary">{answer}</p>
            <p className="mt-1.5 text-[0.7rem] leading-snug text-dim">
              Em {shown} {shown === 1 ? 'degrau' : 'degraus'}. Da próxima vez a dica começa em{' '}
              {Math.max(1, shown - 1)}.
            </p>
          </div>
        ) : (
          rungs.slice(0, shown).map((rung, i) => (
            <div
              key={rung.level}
              className={`shrink-0 rounded-xl border border-line-soft px-3 py-2 transition-opacity duration-500 ${
                i < shown - 1 ? 'opacity-40' : ''
              }`}
            >
              <span className="label-caps">
                degrau {rung.level} · {rung.kind}
              </span>
              <p className="mt-0.5 text-[0.95rem] leading-snug">{rung.text}</p>
            </div>
          ))
        )}
      </div>

      {resolved ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-[0.8rem] font-semibold text-dim"
        >
          <RotateCcw className="size-3.5" />
          ver de novo
        </button>
      ) : (
        <button
          type="button"
          onClick={onArm}
          disabled={armed}
          aria-label={armed ? 'Procurando o caminho' : 'Travou — pedir ajuda agora'}
          className={`mt-3 w-full rounded-full py-3.5 text-[0.9rem] font-bold transition-colors ${
            armed ? 'bg-surface-2 text-faint' : 'bg-primary text-primary-foreground'
          }`}
        >
          {armed ? 'procurando o caminho…' : 'Travou'}
        </button>
      )}
    </div>
  )
}
