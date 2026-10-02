'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { WeekPoint } from './api'
import { formatLevel } from './format'

const MAX_LEVEL = 4
const PAD = { top: 30, right: 20, bottom: 32, left: 74 }
const EXAMPLE_COLOR = '#a19db3'
const LIVE_COLOR = '#6b5fa8'
const LEVEL_NAME = ['sozinha', 'categoria', 'relação', 'lugar', 'som']

interface Slot {
  x: number
  label: string
  level: number | null
  attempts: number | null
  source: 'example' | 'live'
}

export function TrendChart({
  example,
  live,
  showExample
}: {
  example: number[]
  live: WeekPoint[]
  showExample: boolean
}) {
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const observer = new ResizeObserver(entries => {
      const next = entries[0]?.contentRect.width
      if (next) setWidth(Math.round(next))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const compact = width < 520
  const height = compact ? 230 : 300
  const pad = compact ? { ...PAD, left: 30 } : PAD
  const prefix = showExample ? example : []
  const liveWeeks = Math.max(1, ...live.map(point => point.week))
  const total = prefix.length + liveWeeks
  const plotWidth = width - pad.left - pad.right
  const plotHeight = height - pad.top - pad.bottom
  const step = plotWidth / total
  const xAt = (index: number) => pad.left + step * (index + 0.5)
  const yAt = (level: number) => pad.top + plotHeight * (1 - level / MAX_LEVEL)

  const slots: Slot[] = [
    ...prefix.map((level, index) => ({
      x: xAt(index),
      label: `S${index + 1}`,
      level,
      attempts: null,
      source: 'example' as const
    })),
    ...Array.from({ length: liveWeeks }, (_, index) => {
      const point = live.find(item => item.week === index + 1)
      return {
        x: xAt(prefix.length + index),
        label: `S${prefix.length + index + 1}`,
        level: point?.averageLevel ?? null,
        attempts: point?.attempts ?? null,
        source: 'live' as const
      }
    })
  ]

  const exampleSlots = slots.filter(slot => slot.source === 'example')
  const liveSlots = slots.filter(slot => slot.source === 'live' && slot.level != null)
  const lastLive = liveSlots.at(-1)
  const divider = pad.left + step * prefix.length
  const bottom = pad.top + plotHeight
  const path = (points: Slot[]) =>
    points.map((slot, i) => `${i === 0 ? 'M' : 'L'}${slot.x},${yAt(slot.level ?? 0)}`).join(' ')
  const area =
    liveSlots.length > 1
      ? `${path(liveSlots)} L${liveSlots[liveSlots.length - 1].x},${bottom} L${liveSlots[0].x},${bottom} Z`
      : null
  const labelEvery = Math.max(1, Math.ceil(total / Math.max(4, Math.floor(plotWidth / 44))))

  function onPointer(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.floor((event.clientX - box.left - pad.left) / step)
    setHover(index >= 0 && index < total ? index : null)
  }

  const hovered = hover == null ? null : slots[hover]

  return (
    <div ref={frame} className="relative w-full">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={
          showExample
            ? `Degrau médio por semana: histórico de exemplo nas semanas 1 a ${prefix.length} e dados ao vivo em seguida`
            : 'Degrau médio por semana, dados ao vivo'
        }
        className="block touch-pan-y select-none"
        onPointerMove={onPointer}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <pattern
            id="fono-example-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="#f6f5fa" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#eceaf3" strokeWidth="3" />
          </pattern>
        </defs>

        {prefix.length > 0 && (
          <>
            <rect
              x={pad.left}
              y={pad.top - 22}
              width={divider - pad.left}
              height={plotHeight + 22}
              rx={8}
              fill="url(#fono-example-hatch)"
            />
            <text x={pad.left + 10} y={pad.top - 8} fontSize={11} fill="#6a6779" fontWeight={700}>
              {compact ? 'EXEMPLO' : 'HISTÓRICO DE EXEMPLO · não é dado real'}
            </text>
            <line
              x1={divider}
              x2={divider}
              y1={pad.top - 22}
              y2={bottom}
              stroke="#d9d4ea"
              strokeDasharray="3 4"
            />
          </>
        )}
        <text x={divider + 10} y={pad.top - 8} fontSize={11} fill={LIVE_COLOR} fontWeight={800}>
          AO VIVO
        </text>

        {Array.from({ length: MAX_LEVEL + 1 }, (_, level) => (
          <g key={level}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={yAt(level)}
              y2={yAt(level)}
              stroke="#efedf5"
            />
            <text
              x={pad.left - 10}
              y={yAt(level) + 4}
              fontSize={11}
              textAnchor="end"
              fill="#8d8a9c"
              className="tabular"
            >
              {compact ? level : `${level} · ${LEVEL_NAME[level]}`}
            </text>
          </g>
        ))}

        {slots.map((slot, index) =>
          index % labelEvery !== 0 && index !== total - 1 ? null : (
            <text
              key={slot.label}
              x={slot.x}
              y={height - 10}
              fontSize={11}
              textAnchor="middle"
              fill={slot.source === 'live' ? LIVE_COLOR : '#a19db3'}
              fontWeight={slot.source === 'live' ? 700 : 500}
            >
              {slot.label}
            </text>
          )
        )}

        {hovered && (
          <rect
            x={hovered.x - step / 2 + 2}
            y={pad.top}
            width={Math.max(0, step - 4)}
            height={plotHeight}
            rx={6}
            fill={hovered.source === 'live' ? '#6b5fa8' : '#8d8a9c'}
            fillOpacity={0.06}
          />
        )}

        {exampleSlots.length > 0 && (
          <path
            d={path(exampleSlots)}
            fill="none"
            stroke={EXAMPLE_COLOR}
            strokeWidth={2}
            strokeDasharray="5 5"
            strokeLinecap="round"
          />
        )}
        {exampleSlots.map(slot => (
          <circle
            key={slot.label}
            cx={slot.x}
            cy={yAt(slot.level ?? 0)}
            r={3.5}
            fill="#fff"
            stroke={EXAMPLE_COLOR}
            strokeWidth={2}
          />
        ))}

        {area && <path d={area} fill="#8e7ff0" fillOpacity={0.08} />}
        {liveSlots.length > 1 && (
          <path
            d={path(liveSlots)}
            fill="none"
            stroke={LIVE_COLOR}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {liveSlots.map(slot => (
          <circle
            key={slot.label}
            cx={slot.x}
            cy={yAt(slot.level ?? 0)}
            r={hovered === slot ? 6.5 : 5}
            fill={LIVE_COLOR}
            stroke="#fff"
            strokeWidth={2}
          />
        ))}
        {lastLive && (
          <>
            <circle
              cx={lastLive.x}
              cy={yAt(lastLive.level ?? 0)}
              r={11}
              fill="none"
              stroke={LIVE_COLOR}
              strokeOpacity={0.3}
              className="v3-live-dot"
              style={{ transformOrigin: `${lastLive.x}px ${yAt(lastLive.level ?? 0)}px` }}
            />
            <text
              x={lastLive.x}
              y={yAt(lastLive.level ?? 0) - 16}
              fontSize={13}
              fontWeight={800}
              textAnchor="middle"
              fill="#1b1a22"
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
              className="tabular"
            >
              {formatLevel(lastLive.level)}
            </text>
          </>
        )}
        {!lastLive && (
          <text
            x={xAt(prefix.length)}
            y={yAt(MAX_LEVEL / 2)}
            fontSize={11}
            textAnchor="middle"
            fill="#8d8a9c"
          >
            aguardando
          </text>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-6 z-10 w-max max-w-[13rem] -translate-x-1/2 rounded-lg border border-[#e6e3ef] bg-white px-3 py-2 text-[0.75rem] leading-snug shadow-[0_10px_28px_-16px_rgba(70,55,120,0.45)]"
          style={{ left: Math.min(Math.max(hovered.x, 90), width - 90) }}
        >
          <p className="font-semibold text-[#1b1a22]">
            Semana {hovered.label.slice(1)} · {hovered.source === 'live' ? 'ao vivo' : 'exemplo'}
          </p>
          <p className="text-[#6a6779]">
            {hovered.level == null
              ? 'sem palavras alcançadas'
              : `degrau médio ${formatLevel(hovered.level)}`}
            {hovered.attempts != null &&
              ` · ${hovered.attempts} ${hovered.attempts === 1 ? 'palavra' : 'palavras'}`}
          </p>
        </div>
      )}
    </div>
  )
}
