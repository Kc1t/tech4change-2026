const TILES = [
  {
    src: '/story/scene-granddaughter.webp',
    position: 'object-[52%_28%]',
    className: 'right-[4%] bottom-[38%] w-[62%] rotate-[-7deg] grayscale'
  },
  {
    src: '/story/scene-photos.webp',
    position: 'object-[58%_42%]',
    className: 'right-[36%] bottom-[4%] w-[56%] rotate-[4deg]'
  }
]

export function SeedArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 h-[58%] w-[58%]">
      {TILES.map(tile => (
        <span
          key={tile.src}
          className={`absolute overflow-hidden rounded-[0.7rem] border-[3px] border-white shadow-[0_12px_28px_-14px_rgba(70,55,120,0.55)] ${tile.className}`}
        >
          <img
            src={tile.src}
            alt=""
            loading="lazy"
            className={`aspect-[4/3] size-full object-cover ${tile.position}`}
          />
        </span>
      ))}

      <span className="absolute right-[2%] bottom-[8%] flex h-9 w-[40%] items-center justify-center gap-[3px] rounded-[0.7rem] border border-white bg-white/85 shadow-[0_12px_28px_-16px_rgba(70,55,120,0.5)] backdrop-blur-sm">
        {[5, 11, 7, 16, 9, 20, 13, 22, 10, 15, 6].map((h, i) => (
          <i
            key={i}
            className="w-[2px] rounded-full bg-[var(--v3-accent)]/70"
            style={{ height: `${h}px` }}
          />
        ))}
      </span>
    </div>
  )
}

const PILLS = [
  { label: 'Família', className: 'left-[2%] bottom-[8%]' },
  { label: 'Amigos', className: 'right-[3%] bottom-[54%]' },
  { label: 'Lugares', className: 'right-[1%] bottom-[2%]' }
]

export function GraphArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%]">
      <svg viewBox="0 0 320 150" className="absolute inset-x-0 bottom-[6%] w-[64%] translate-x-[34%]">
        <g stroke="var(--v3-accent)" strokeOpacity="0.35" strokeWidth="1.6" fill="none">
          <path d="M92 96 L128 70 L196 58 M128 70 L150 108 L214 116 M196 58 L214 116" />
        </g>
        {[
          [92, 96, 5],
          [128, 70, 6],
          [150, 108, 5],
          [196, 58, 6],
          [214, 116, 5]
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="var(--v3-accent)" opacity="0.55" />
        ))}
        <circle cx="163" cy="86" r="17" fill="var(--v3-accent)" />
        <g fill="#fff" transform="translate(163 86)">
          <circle cy="-4" r="4.2" />
          <path d="M-7 8c0-4 3-6.5 7-6.5S7 4 7 8Z" />
        </g>
      </svg>

      {PILLS.map(pill => (
        <span
          key={pill.label}
          className={`absolute rounded-full border border-[var(--v3-line)] bg-white px-3.5 py-1.5 text-[0.72rem] font-medium text-[var(--v3-accent)] shadow-[0_8px_20px_-14px_rgba(70,55,120,0.6)] ${pill.className}`}
        >
          {pill.label}
        </span>
      ))}
    </div>
  )
}
