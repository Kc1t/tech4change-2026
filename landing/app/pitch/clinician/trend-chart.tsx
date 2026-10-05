import { useState } from 'react'
import { LEVEL_NAME, WEEKS } from './data'
import { formatLevel, type TrendPoint } from './stats'

const CHART = { width: 960, height: 372, top: 30, right: 20, bottom: 34, left: 92 }
const LEVELS = [0, 1, 2, 3, 4]
const MAX_LEVEL = 4

export function TrendChart({ trend }: { trend: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const plotWidth = CHART.width - CHART.left - CHART.right
  const plotHeight = CHART.height - CHART.top - CHART.bottom
  const step = plotWidth / trend.length
  const x = (index: number) => CHART.left + step * (index + 0.5)
  const y = (level: number) => CHART.top + plotHeight * (1 - level / MAX_LEVEL)
  const bottom = CHART.top + plotHeight
  const line = trend.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.level)}`).join(' ')
  const area = `${line} L${x(trend.length - 1)},${bottom} L${x(0)},${bottom} Z`
  const last = trend[trend.length - 1]
  const hovered = hover == null ? null : trend[hover]

  return (
    <div className="cd-chart">
      <div className="cd-legend">
        <span>
          <svg width="22" height="8" aria-hidden="true"><line x1="1" x2="21" y1="4" y2="4" stroke="#6b5fa8" strokeWidth="2.5" /><circle cx="11" cy="4" r="3.5" fill="#6b5fa8" /></svg>
          ao vivo, vindo do app · {WEEKS} semanas
        </span>
      </div>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="cd-chart-svg" role="img" aria-label="Pistas por palavra, por semana, caindo ao longo de oito semanas" onPointerLeave={() => setHover(null)}>
        <text x={CHART.left + 10} y={CHART.top - 10} fontSize={12} fill="#6b5fa8" fontWeight={800}>AO VIVO</text>
        {LEVELS.map(level => (
          <g key={level}>
            <line x1={CHART.left} x2={CHART.width - CHART.right} y1={y(level)} y2={y(level)} stroke="#efedf5" />
            <text x={CHART.left - 12} y={y(level) + 4} fontSize={12.5} textAnchor="end" fill="#8d8a9c" className="cd-tab">{level} · {LEVEL_NAME[level]}</text>
          </g>
        ))}
        {trend.map((point, index) => (
          <text key={point.week} x={x(index)} y={CHART.height - 10} fontSize={12.5} textAnchor="middle" fill="#6b5fa8" fontWeight={700}>S{point.week}</text>
        ))}
        {hover != null && <rect x={x(hover) - step / 2 + 2} y={CHART.top} width={step - 4} height={plotHeight} rx={6} fill="#6b5fa8" fillOpacity={0.06} />}
        <path d={area} fill="#8e7ff0" fillOpacity={0.08} />
        <path d={line} fill="none" stroke="#6b5fa8" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" className="cd-draw" />
        {trend.map((point, index) => (
          <circle key={point.week} cx={x(index)} cy={y(point.level)} r={hover === index ? 6.5 : 5} fill="#6b5fa8" stroke="#fff" strokeWidth={2} />
        ))}
        <circle cx={x(trend.length - 1)} cy={y(last.level)} r={11} fill="none" stroke="#6b5fa8" strokeOpacity={0.3} className="cd-live-dot" style={{ transformOrigin: `${x(trend.length - 1)}px ${y(last.level)}px` }} />
        <text x={x(trend.length - 1)} y={y(last.level) - 17} fontSize={15} fontWeight={800} textAnchor="middle" fill="#1b1a22" stroke="#fff" strokeWidth={4} paintOrder="stroke" className="cd-tab">{formatLevel(last.level)}</text>
        {trend.map((point, index) => (
          <rect key={point.week} x={x(index) - step / 2} y={CHART.top} width={step} height={plotHeight} fill="transparent" onPointerEnter={() => setHover(index)} />
        ))}
      </svg>
      {hover != null && hovered && (
        <div className="cd-tip" style={{ left: `${(x(hover) / CHART.width) * 100}%` }}>
          <p>Semana {hovered.week} · ao vivo</p>
          <span>{formatLevel(hovered.level)} pistas por palavra · {hovered.attempts} palavras</span>
        </div>
      )}
    </div>
  )
}
