'use client'

export type GraphSeed = { owner: string; person: string; place: string }
export type GraphHighlight = 'family' | 'person' | 'place' | 'syllable' | null

const POSITION = {
  owner: { x: 150, y: 152 },
  person: { x: 150, y: 64 },
  place: { x: 246, y: 198 }
} as const

type NodeId = keyof typeof POSITION

export function GraphCanvas({
  seed,
  present,
  highlight = null,
  syllable = ''
}: {
  seed: GraphSeed
  present: NodeId[]
  highlight?: GraphHighlight
  syllable?: string
}) {
  const has = (id: NodeId) => present.includes(id)
  const edges = [
    { id: 'family', from: 'owner' as NodeId, to: 'person' as NodeId, label: 'é da família' },
    { id: 'place', from: 'person' as NodeId, to: 'place' as NodeId, label: 'mora em' }
  ].filter(edge => has(edge.from) && has(edge.to))

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox="0 0 300 250" className="w-full" role="img" aria-label="O seu mapa">
        {present.length === 0 && (
          <g>
            <circle
              cx={POSITION.owner.x}
              cy={POSITION.owner.y}
              r={22}
              fill="none"
              stroke="var(--line)"
              strokeWidth={1.5}
              strokeDasharray="4 5"
            />
            <text
              x={POSITION.owner.x}
              y={POSITION.owner.y + 5}
              textAnchor="middle"
              fill="var(--faint)"
              fontSize="15"
            >
              ?
            </text>
          </g>
        )}

        {edges.map(edge => {
          const from = POSITION[edge.from]
          const to = POSITION[edge.to]
          const lit = highlight === edge.id
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          return (
            <g key={edge.id} className="transition-opacity duration-700" style={{ opacity: 1 }}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={lit ? 'var(--brand)' : 'var(--line)'}
                strokeWidth={lit ? 2.4 : 1.4}
                className="transition-all duration-500"
              />
              <text
                x={midX + 16}
                y={midY + 4}
                fill={lit ? 'var(--brand)' : 'var(--faint)'}
                fontSize="9"
                className="transition-colors duration-500"
                style={{ letterSpacing: '0.04em' }}
              >
                {edge.label}
              </text>
            </g>
          )
        })}

        {(Object.keys(POSITION) as NodeId[]).map(id => {
          if (!has(id)) return null
          const spot = POSITION[id]
          const lit =
            (highlight === 'person' && id === 'person') ||
            (highlight === 'place' && id === 'place') ||
            (highlight === 'syllable' && id === 'person')
          const isOwner = id === 'owner'
          const label = id === 'owner' ? seed.owner : id === 'person' ? seed.person : seed.place
          const shown = highlight === 'syllable' && id === 'person' ? `${syllable}…` : label

          return (
            <g key={id}>
              {lit && (
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={26}
                  fill="var(--brand)"
                  opacity={0.16}
                  className="[animation:pulse-ring_2s_ease-out_infinite]"
                  style={{ transformOrigin: `${spot.x}px ${spot.y}px` }}
                />
              )}
              <circle
                cx={spot.x}
                cy={spot.y}
                r={isOwner ? 19 : 16}
                fill={lit ? 'var(--brand)' : isOwner ? 'var(--fg)' : 'var(--mastery-medium)'}
                className="transition-all duration-500"
              />
              <text
                x={spot.x}
                y={spot.y + (id === 'person' ? -26 : isOwner ? 40 : 34)}
                textAnchor="middle"
                fill={lit ? 'var(--brand)' : 'var(--dim)'}
                fontSize="12"
                fontWeight="600"
                className="transition-colors duration-500"
              >
                {shown}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="tabular text-center text-[0.72rem] text-faint">
        {present.length} {present.length === 1 ? 'nó' : 'nós'} · {edges.length}{' '}
        {edges.length === 1 ? 'aresta' : 'arestas'}
      </p>
    </div>
  )
}
