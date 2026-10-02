import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Leaf,
  Lightbulb,
  MessageCircle,
  Minus,
  TrendingDown
} from 'lucide-react'
import type { Kpis, Suggestion, WordRow } from './derive'
import { formatLevel, formatSeconds, plural } from './format'

export function Panel({
  title,
  note,
  action,
  children,
  className = ''
}: {
  title: string
  note?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-[#e6e3ef] bg-white ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="text-[0.98rem] font-semibold tracking-[-0.015em] text-[#1b1a22]">{title}</h2>
          {note && <p className="mt-0.5 text-[0.8rem] leading-relaxed text-[#6a6779]">{note}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

type Mood = 'good' | 'bad' | 'neutral'

const MOOD_STYLE: Record<Mood, string> = {
  good: 'text-[#2f7a57]',
  bad: 'text-[#a2456f]',
  neutral: 'text-[#6a6779]'
}

function Delta({
  value,
  format,
  lowerIsBetter
}: {
  value: number
  format: (value: number) => string
  lowerIsBetter: boolean | null
}) {
  const flat = Math.abs(value) < 0.05
  const mood: Mood =
    flat || lowerIsBetter == null ? 'neutral' : value < 0 === lowerIsBetter ? 'good' : 'bad'
  const Icon = flat ? Minus : value < 0 ? ArrowDown : ArrowUp
  return (
    <span
      className={`tabular inline-flex items-center gap-0.5 text-[0.76rem] font-semibold ${MOOD_STYLE[mood]}`}
    >
      <Icon className="size-3" strokeWidth={2.75} />
      {flat ? 'igual' : format(Math.abs(value))}
    </span>
  )
}

function Kpi({
  label,
  hint,
  value,
  unit,
  footer
}: {
  label: string
  hint: string
  value: string
  unit?: string
  footer: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col bg-white px-5 py-4">
      <p className="text-[0.82rem] leading-tight font-medium text-[#3a3846]">{label}</p>
      <p className="mt-0.5 text-[0.74rem] leading-tight text-[#8d8a9c]">{hint}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular text-[2.1rem] leading-none font-semibold tracking-[-0.035em] text-[#1b1a22]">
          {value}
        </span>
        {unit && <span className="text-[0.8rem] text-[#8d8a9c]">{unit}</span>}
      </p>
      <div className="mt-2 flex min-h-[1.3rem] flex-wrap items-center gap-1.5 text-[0.76rem] text-[#6a6779]">
        {footer}
      </div>
    </div>
  )
}

export function KpiRow({
  kpis,
  words,
  periodLabel
}: {
  kpis: Kpis
  words: WordRow[]
  periodLabel: string
}) {
  const { current, previous, levelNow, levelBefore, compareLabel } = kpis
  const reached = words.filter(row => row.attempts > 0)
  const unaided = reached.filter(row => row.state === 'unaided').length
  const oneRung = reached.filter(row => row.state === 'one_rung').length
  const noCompare = <span className="text-[#8d8a9c]">sem comparação ainda</span>

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e6e3ef] bg-[#efedf5] xl:grid-cols-4">
      <Kpi
        label="Degrau médio"
        hint={
          kpis.previous == null && compareLabel.startsWith('desde')
            ? 'última semana'
            : periodLabel.toLowerCase()
        }
        value={formatLevel(levelNow)}
        unit="de 4"
        footer={
          levelNow != null && levelBefore != null ? (
            <>
              <Delta value={levelNow - levelBefore} format={formatLevel} lowerIsBetter />
              <span>{compareLabel}</span>
            </>
          ) : (
            noCompare
          )
        }
      />
      <Kpi
        label="Travamentos"
        hint="fora da sessão"
        value={String(current.blocks)}
        footer={
          previous ? (
            <>
              <Delta
                value={current.blocks - previous.blocks}
                format={String}
                lowerIsBetter={null}
              />
              <span>{compareLabel}</span>
            </>
          ) : (
            <span>{plural(current.resolved, 'palavra alcançada', 'palavras alcançadas')}</span>
          )
        }
      />
      <Kpi
        label="Saem sozinhas"
        hint="palavras sem pista"
        value={String(unaided)}
        unit={`de ${reached.length}`}
        footer={
          <span>{oneRung > 0 ? `+ ${oneRung} com uma pista` : 'nenhuma com uma pista ainda'}</span>
        }
      />
      <Kpi
        label="Tempo até dizer"
        hint="do travar ao dizer"
        value={
          current.averageElapsed == null
            ? '—'
            : formatSeconds(current.averageElapsed).replace(' s', '')
        }
        unit={current.averageElapsed == null ? undefined : 'seg'}
        footer={
          previous?.averageElapsed != null && current.averageElapsed != null ? (
            <>
              <Delta
                value={(current.averageElapsed - previous.averageElapsed) / 1000}
                format={value => `${formatLevel(value)} s`}
                lowerIsBetter
              />
              <span>{compareLabel}</span>
            </>
          ) : (
            noCompare
          )
        }
      />
    </div>
  )
}

const TONE: Record<Suggestion['tone'], { icon: ReactNode; style: string }> = {
  work: { icon: <Lightbulb className="size-3.5" />, style: 'bg-[#f7e0c6] text-[#7a4a1c]' },
  attention: { icon: <MessageCircle className="size-3.5" />, style: 'bg-[#f9d9cf] text-[#8a3b2a]' },
  progress: { icon: <TrendingDown className="size-3.5" />, style: 'bg-[#d3e8d8] text-[#2f6b47]' },
  calm: { icon: <Leaf className="size-3.5" />, style: 'bg-[#d8ecfb] text-[#2b5a7a]' }
}

export function Suggestions({ items }: { items: Suggestion[] }) {
  if (items.length === 0) {
    return (
      <p className="px-5 pb-5 text-[0.84rem] leading-relaxed text-[#6a6779]">
        Ainda pouco dado para sugerir algo. As ideias aparecem conforme a semana acontece.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1 px-3 pb-3">
      {items.map(item => (
        <li
          key={item.id}
          className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#faf9fd]"
        >
          <span
            className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${TONE[item.tone].style}`}
          >
            {TONE[item.tone].icon}
          </span>
          <p className="text-[0.86rem] leading-snug text-[#3a3846]">{item.text}</p>
        </li>
      ))}
    </ul>
  )
}
