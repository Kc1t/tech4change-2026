'use client'

import { useId } from 'react'

const W = 390
const H = 150
const PAD = { top: 26, bottom: 30, left: -12, right: 402 }

function curve(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${PAD.left},${points[0]!.y}L${W},${points[0]!.y}`

  let d = `M${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}`

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!
    const next = points[i + 1]!
    const midX = (current.x + next.x) / 2
    d += `C${midX.toFixed(1)},${current.y.toFixed(1)} ${midX.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`
  }

  return d
}

export function TrendSky({ series, marks }: { series: number[]; marks: string[] }) {
  const line = useId()
  const dash = useId()
  const glow = useId()

  const points = series.map((value, index) => ({
    x: PAD.left + (series.length === 1 ? 0.5 : index / (series.length - 1)) * (PAD.right - PAD.left),
    y: PAD.top + (1 - Math.min(100, Math.max(0, value)) / 100) * (H - PAD.top - PAD.bottom)
  }))

  const path = curve(points)
  const halfway = series.findIndex(value => value >= 50)
  const highlights = [...new Set([halfway, series.length - 1])]
    .map(index => points[index])
    .filter(
      (point): point is { x: number; y: number } =>
        Boolean(point) && point!.x > 28 && point!.x < W - 28
    )

  return (
    <div className="relative h-48 w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={line} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--aurora-1)" />
            <stop offset="35%" stopColor="var(--aurora-4)" />
            <stop offset="55%" stopColor="var(--mastery-high)" />
            <stop offset="75%" stopColor="var(--aurora-1)" />
            <stop offset="100%" stopColor="var(--brand-rose)" />
          </linearGradient>

          <linearGradient id={dash} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--mastery-high)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--mastery-high)" stopOpacity="0" />
          </linearGradient>

          <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#8e7ff0" floodOpacity="0.3" />
          </filter>
        </defs>

        <path
          d="M-20,115 Q 30,95 80,105 T 180,100 T 260,110 T 340,90 T 410,115 L410,150 L-20,150 Z"
          fill="#dcd4f2"
          opacity="0.3"
        />
        <path
          d="M-20,125 Q 50,110 110,120 T 220,115 T 310,125 T 410,110 L410,150 L-20,150 Z"
          fill="#f6f2fd"
          opacity="0.6"
        />

        {highlights.map(point => (
          <line
            key={`${point.x}-${point.y}`}
            x1={point.x}
            y1={point.y}
            x2={point.x}
            y2={H - 10}
            stroke={`url(#${dash})`}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}

        {path && (
          <path
            d={path}
            fill="none"
            stroke={`url(#${line})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            filter={`url(#${glow})`}
          />
        )}

        {highlights.map(point => (
          <g key={`dot-${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6.5"
              fill="var(--surface)"
              stroke="var(--aurora-4)"
              strokeWidth="2.5"
            />
            <circle cx={point.x} cy={point.y} r="3.5" fill="var(--mastery-high)" />
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-0 -mb-5 flex justify-between px-7 text-[11px] font-semibold uppercase tracking-wider text-faint">
        {marks.map((mark, index) => (
          <span key={`${mark}-${index}`}>{mark}</span>
        ))}
      </div>
    </div>
  )
}
