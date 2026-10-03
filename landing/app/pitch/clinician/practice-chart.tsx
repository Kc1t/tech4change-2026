import { ArrowUp } from 'lucide-react'
import { ESO_MINUTES, PRACTICE, WEEKS } from './data'
import { formatMinutes } from './stats'

const MAX_MINUTES = 240
const GRID_MINUTES = [0, 60, 120, 180, 240]
const DAY_BAR_MINUTES = 45
const DAY_BAR_HEIGHT = 62
const CHART = { width: 640, height: 330, top: 26, bottom: 46, left: 44, right: 12 }

export function PracticeChart() {
  const week = PRACTICE.minutes[WEEKS - 1]
  const days = PRACTICE.thisWeek.filter(day => day.minutes > 0).length
  const streak = PRACTICE.minutes.slice().reverse().findIndex(minutes => minutes < ESO_MINUTES)
  const plotHeight = CHART.height - CHART.top - CHART.bottom
  const step = (CHART.width - CHART.left - CHART.right) / WEEKS
  const y = (minutes: number) => CHART.top + plotHeight * (1 - minutes / MAX_MINUTES)

  return (
    <div className="cd-practice">
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="cd-practice-svg" role="img" aria-label="Minutos de prática por semana subindo acima da meta de 3 horas">
        {GRID_MINUTES.map(minutes => (
          <g key={minutes}>
            <line x1={CHART.left} x2={CHART.width - CHART.right} y1={y(minutes)} y2={y(minutes)} stroke="#efedf5" />
            <text x={CHART.left - 10} y={y(minutes) + 4} fontSize={12} textAnchor="end" fill="#8d8a9c">{minutes / 60} h</text>
          </g>
        ))}
        {PRACTICE.minutes.map((minutes, index) => {
          const barX = CHART.left + step * index + step * 0.2
          const onTarget = minutes >= ESO_MINUTES
          return (
            <g key={index}>
              <rect x={barX} y={y(minutes)} width={step * 0.6} height={y(0) - y(minutes)} rx={6} fill={onTarget ? '#6b5fa8' : '#d9d1f7'} className="cd-grow" style={{ animationDelay: `${index * 60}ms` }} />
              <text x={barX + step * 0.3} y={y(minutes) - 8} fontSize={12} textAnchor="middle" fill={onTarget ? '#1b1a22' : '#6a6779'} fontWeight={700} stroke="#fff" strokeWidth={4} paintOrder="stroke" className="cd-tab">{formatMinutes(minutes).replace(' ', '')}</text>
              <text x={barX + step * 0.3} y={CHART.height - 26} fontSize={12.5} textAnchor="middle" fill="#6b5fa8" fontWeight={700}>S{index + 1}</text>
              <text x={barX + step * 0.3} y={CHART.height - 9} fontSize={11.5} textAnchor="middle" fill="#8d8a9c">{PRACTICE.days[index]} dias</text>
            </g>
          )
        })}
        <line x1={CHART.left} x2={CHART.width - CHART.right} y1={y(ESO_MINUTES)} y2={y(ESO_MINUTES)} stroke="#2f7a57" strokeWidth={1.75} strokeDasharray="6 5" />
        <text x={CHART.left + 8} y={y(ESO_MINUTES) - 8} fontSize={12} fontWeight={800} fill="#2f7a57">META ESO · 3 h por semana</text>
      </svg>

      <div className="cd-practice-side">
        <div className="cd-practice-big">
          <p className="cd-kpi-label">Esta semana</p>
          <p className="cd-kpi-value"><span>{formatMinutes(week)}</span></p>
          <span className="cd-delta cd-delta--good"><ArrowUp strokeWidth={2.75} />{week - PRACTICE.minutes[WEEKS - 2]} min</span>
          <span className="cd-faint"> vs. semana anterior</span>
        </div>
        <div className="cd-days">
          {PRACTICE.thisWeek.map(day => (
            <span key={day.label} className={day.minutes > 0 ? 'on' : undefined}>
              <i style={{ height: Math.max(6, (day.minutes / DAY_BAR_MINUTES) * DAY_BAR_HEIGHT) }} />
              <b>{day.label}</b>
            </span>
          ))}
        </div>
        <p className="cd-practice-note">
          <b>{days} de 7 dias</b> com prática · <b>{streak < 0 ? WEEKS : streak} semanas seguidas</b> acima da meta. Na sessão, ela tem 1 hora por semana.
        </p>
      </div>
    </div>
  )
}
