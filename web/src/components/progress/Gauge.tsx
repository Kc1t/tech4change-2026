const SEGMENTS = [
  { grow: 1, background: 'linear-gradient(90deg,var(--brand-rose),var(--aurora-1))' },
  { grow: 1.2, background: 'linear-gradient(90deg,var(--aurora-1),var(--aurora-4))' },
  { grow: 0.8, background: 'linear-gradient(90deg,var(--mastery-high),var(--aurora-4))' },
  { grow: 1.1, background: 'linear-gradient(90deg,var(--aurora-1),var(--brand-rose))' }
]

export function Gauge({ value, caption }: { value: number; caption: string }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={caption}
      className="relative flex h-6 w-full gap-1.5"
    >
      <span
        aria-hidden="true"
        style={{ left: `${Math.min(97, Math.max(3, clamped))}%` }}
        className="absolute -top-2 -translate-x-1/2"
      >
        <svg viewBox="0 0 8 6" className="h-1.5 w-2">
          <path d="M4 6 0 0h8z" fill="var(--faint)" />
        </svg>
      </span>

      {SEGMENTS.map((segment, index) => (
        <span
          key={index}
          style={{ flexGrow: segment.grow, background: segment.background }}
          className="h-full flex-1 rounded-full opacity-90"
        />
      ))}
    </div>
  )
}
