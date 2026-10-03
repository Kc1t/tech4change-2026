import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { PERIOD_LABEL, type Period } from './data'
import { formatLevel, type Kpis, type Row } from './stats'

const FLAT = 0.05

function Delta({ value, format, lowerIsBetter }: { value: number; format: (value: number) => string; lowerIsBetter: boolean | null }) {
  const flat = Math.abs(value) < FLAT
  const mood = flat || lowerIsBetter == null ? 'neutral' : value < 0 === lowerIsBetter ? 'good' : 'bad'
  const Icon = flat ? Minus : value < 0 ? ArrowDown : ArrowUp
  return (
    <span className={`cd-delta cd-delta--${mood}`}>
      <Icon strokeWidth={2.75} />
      {flat ? 'igual' : format(Math.abs(value))}
    </span>
  )
}

function Kpi({ label, hint, value, unit, footer }: { label: string; hint: string; value: string; unit?: string; footer: ReactNode }) {
  return (
    <div className="cd-kpi">
      <p className="cd-kpi-label">{label}</p>
      <p className="cd-kpi-hint">{hint}</p>
      <p className="cd-kpi-value">
        <span>{value}</span>
        {unit && <small>{unit}</small>}
      </p>
      <div className="cd-kpi-foot">{footer}</div>
    </div>
  )
}

export function KpiRow({ kpis, rows, period }: { kpis: Kpis; rows: Row[]; period: Period }) {
  const { current, previous, levelNow, levelBefore, compare } = kpis
  const reached = rows.filter(row => row.attempts > 0)
  const unaided = reached.filter(row => row.state === 'unaided').length
  const oneRung = reached.filter(row => row.state === 'one_rung').length
  return (
    <div className="cd-kpis">
      <Kpi
        label="Degrau médio"
        hint={PERIOD_LABEL[period].toLowerCase()}
        value={formatLevel(levelNow)}
        unit="de 4"
        footer={levelNow != null && levelBefore != null && <><Delta value={levelNow - levelBefore} format={formatLevel} lowerIsBetter /><span>{compare}</span></>}
      />
      <Kpi
        label="Travamentos"
        hint="fora da sessão"
        value={String(current.blocks)}
        footer={previous ? <><Delta value={current.blocks - previous.blocks} format={String} lowerIsBetter={null} /><span>{compare}</span></> : <span>{current.resolved} palavras alcançadas</span>}
      />
      <Kpi
        label="Saem sozinhas"
        hint="palavras sem pista"
        value={String(unaided)}
        unit={`de ${reached.length}`}
        footer={<span>{oneRung > 0 ? `+ ${oneRung} com uma pista` : 'nenhuma com uma pista ainda'}</span>}
      />
      <Kpi
        label="Tempo até dizer"
        hint="do travar ao dizer"
        value={formatLevel(current.elapsed)}
        unit="seg"
        footer={previous?.elapsed != null && current.elapsed != null ? <><Delta value={current.elapsed - previous.elapsed} format={value => `${formatLevel(value)} s`} lowerIsBetter /><span>{compare}</span></> : <span className="cd-faint">sem comparação ainda</span>}
      />
    </div>
  )
}
