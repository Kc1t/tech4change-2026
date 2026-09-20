'use client'

export type GraphSeed = { owner: string; person: string; place: string }

const NODES = [
  { id: 'owner', x: 128, y: 140, r: 15, ask: 'você' },
  { id: 'person', x: 214, y: 70, r: 12, ask: 'quem?' },
  { id: 'place', x: 196, y: 210, r: 11, ask: 'onde?' }
] as const

const EDGES = [
  { id: 'family', from: 'owner', to: 'person', label: 'é da família' },
  { id: 'place', from: 'person', to: 'place', label: 'mora em' }
] as const

type NodeId = (typeof NODES)[number]['id']

const DRIFT = { owner: '0s', person: '-2.6s', place: '-5.1s' } as const

export function GraphCanvas({ seed, present }: { seed: GraphSeed; present: NodeId[] }) {
  const has = (id: NodeId) => present.includes(id)
  const spot = (id: NodeId) => NODES.find(node => node.id === id)!
  const name = (id: NodeId) =>
    id === 'owner' ? seed.owner : id === 'person' ? seed.person : seed.place
  const edges = EDGES.filter(edge => has(edge.from) && has(edge.to))
  const newest = present[present.length - 1]

  return (
    <div className="v3-graph relative overflow-hidden rounded-[1.25rem]">
      <svg viewBox="0 0 300 260" className="w-full" role="img" aria-label="O seu mapa">
        <defs>
          <radialGradient id="v3-node-glow">
            <stop offset="0" stopColor="#b9a3f7" stopOpacity="0.55" />
            <stop offset="1" stopColor="#b9a3f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {EDGES.map(edge => {
          const from = spot(edge.from)
          const to = spot(edge.to)
          const live = has(edge.from) && has(edge.to)
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={live ? 'rgba(185,163,247,0.62)' : 'rgba(185,163,247,0.13)'}
              strokeWidth={live ? 1.5 : 1}
              strokeDasharray={live ? undefined : '3 6'}
              className="transition-all duration-700"
            />
          )
        })}

        {edges.map(edge => {
          const from = spot(edge.from)
          const to = spot(edge.to)
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.hypot(dx, dy) || 1
          return (
            <text
              key={edge.id}
              x={(from.x + to.x) / 2 - (dy / len) * 13}
              y={(from.y + to.y) / 2 + (dx / len) * 13 + 3}
              textAnchor="middle"
              fill="rgba(214,206,240,0.6)"
              fontSize="8.5"
              style={{ letterSpacing: '0.05em' }}
            >
              {edge.label}
            </text>
          )
        })}

        {NODES.map(node => {
          const live = has(node.id)
          const fresh = live && node.id === newest

          return (
            <g
              key={node.id}
              className="v3-graph-node"
              style={{ animationDelay: DRIFT[node.id], transformOrigin: `${node.x}px ${node.y}px` }}
            >
              {live ? (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * 2.6}
                  fill="url(#v3-node-glow)"
                  opacity={fresh ? 0.9 : 0.5}
                  className="transition-opacity duration-700"
                />
              ) : null}

              <circle
                cx={node.x}
                cy={node.y}
                r={live ? node.r : node.r * 0.72}
                fill={live ? (node.id === 'owner' ? '#efeafc' : '#b9a3f7') : 'transparent'}
                stroke={live ? 'none' : 'rgba(185,163,247,0.35)'}
                strokeWidth={1.2}
                strokeDasharray={live ? undefined : '3 4'}
                className="transition-all duration-700"
              />

              <text
                x={node.x}
                y={node.y + node.r + 17}
                textAnchor="middle"
                fill={live ? '#e6e1f4' : 'rgba(214,206,240,0.45)'}
                fontSize="11.5"
                fontWeight={live ? 600 : 400}
                className="transition-colors duration-700"
              >
                {live ? name(node.id) : node.ask}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="tabular absolute right-4 bottom-3 text-[0.68rem] text-[rgba(214,206,240,0.48)]">
        {present.length} {present.length === 1 ? 'nó' : 'nós'} · {edges.length}{' '}
        {edges.length === 1 ? 'aresta' : 'arestas'}
      </p>
    </div>
  )
}
