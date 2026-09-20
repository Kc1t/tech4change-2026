const TILES = [
  { src: '/art/seed-bw.webp', className: 'right-[1%] top-[2%] w-[56%]' },
  { src: '/art/seed-girl.webp', className: 'left-[-8%] bottom-[-6%] w-[58%]' },
  { src: '/art/seed-wave.webp', className: 'right-[6%] bottom-[6%] w-[44%]' }
]

export function SeedArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 h-[64%] w-[66%]">
      {TILES.map(tile => (
        <img
          key={tile.src}
          src={tile.src}
          alt=""
          loading="lazy"
          className={`v3-art-soft absolute ${tile.className}`}
        />
      ))}
    </div>
  )
}

const CENTER = { x: 154, y: 78 }

const LEAVES = [
  { label: 'família', x: 62, y: 124, cited: true },
  { label: 'amigos', x: 242, y: 44, cited: false },
  { label: 'lugares', x: 246, y: 122, cited: false }
]

function pillWidth(label: string) {
  return label.length * 6.2 + 26
}

export function GraphArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-[5%] bottom-[7%] w-[84%]">
      <svg viewBox="0 0 300 150" className="w-full">
        {LEAVES.map(leaf => (
          <line
            key={`edge-${leaf.label}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={leaf.x}
            y2={leaf.y}
            stroke="var(--v3-accent)"
            strokeWidth={leaf.cited ? 2 : 1.4}
            strokeOpacity={leaf.cited ? 0.9 : 0.24}
            strokeDasharray={leaf.cited ? undefined : '4 5'}
          />
        ))}

        <circle cx={CENTER.x} cy={CENTER.y} r="19" fill="var(--v3-accent)" />
        <g fill="#fff" transform={`translate(${CENTER.x} ${CENTER.y})`}>
          <circle cy="-4.5" r="4.6" />
          <path d="M-7.6 8.8c0-4.4 3.3-7.1 7.6-7.1s7.6 2.7 7.6 7.1Z" />
        </g>

        {LEAVES.map(leaf => {
          const width = pillWidth(leaf.label)
          return (
            <g key={leaf.label}>
              <rect
                x={leaf.x - width / 2}
                y={leaf.y - 12}
                width={width}
                height="24"
                rx="12"
                fill="#fff"
                stroke={leaf.cited ? 'var(--v3-accent)' : 'var(--v3-line)'}
                strokeWidth={leaf.cited ? 1.4 : 1}
              />
              <text
                x={leaf.x}
                y={leaf.y + 4}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="500"
                fill={leaf.cited ? 'var(--v3-accent)' : '#8f8aa0'}
              >
                {leaf.label}
              </text>
            </g>
          )
        })}

        <g transform="translate(108 101)">
          <circle r="10" fill="var(--v3-accent)" />
          <path
            d="M-4 0.4 L-1.2 3.2 L4.2 -2.6"
            fill="none"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  )
}
