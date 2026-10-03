export type Mark = { id: number; level: number; isFinal: boolean }

const FADES = [1, 0.46, 0.25]

function arc(cx: number, cy: number, r: number, from: number, sweep: number) {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const a = rad(from)
  const b = rad(from + sweep)
  return `M${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(b)} ${cy + r * Math.sin(b)}`
}

function TrailMark({ mark, fade, live }: { mark: Mark; fade: number; live: boolean }) {
  const pairs = mark.isFinal ? 2 : Math.min(2, mark.level)
  return (
    <svg className={`wm-trail-mark${live ? ' wm-live' : ''}`} viewBox="-1 -0.5 2 1" style={{ opacity: fade }} aria-hidden>
      <rect x={-0.17} y={-0.29} width={0.34} height={0.58} rx={0.075} className={mark.isFinal ? 'wm-fill' : 'wm-stroke'} strokeWidth={0.1} />
      {Array.from({ length: pairs }, (_, n) => {
        const rank = n + 1
        const r = 0.28 + 0.14 * rank
        const width = 0.09 - rank * 0.012
        return (
          <g key={rank} className="wm-arcs" style={{ strokeWidth: width }}>
            <path d={arc(0, 0, r, 180 - 22, 44)} />
            <path d={arc(0, 0, r, -22, 44)} />
          </g>
        )
      })}
    </svg>
  )
}

export function ShakeTrail({ marks }: { marks: Mark[] }) {
  return (
    <div className="wm-trail">
      {marks.map((mark, n) => {
        const age = marks.length - 1 - n
        return <TrailMark key={mark.id} mark={mark} fade={FADES[age] ?? FADES[FADES.length - 1]} live={age === 0} />
      })}
    </div>
  )
}
