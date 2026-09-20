const BARS = [
  10, 18, 12, 26, 16, 34, 20, 44, 28, 52, 34, 66, 42, 78, 34, 62, 26, 48, 20, 38, 14, 28, 10, 20,
  14, 26, 18, 34, 12, 22, 8, 14
]

export function Waveform({ active = true, className = '' }: { active?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-[78px] items-center justify-center gap-[3px] ${className}`}
    >
      {BARS.map((height, i) => (
        <i
          key={i}
          className={`w-[3px] rounded-full bg-[linear-gradient(180deg,#8f7fd4,#6b5fa8)] ${
            active ? 'v3-bar' : ''
          }`}
          style={{
            height: `${height}px`,
            opacity: active ? 1 : 0.45,
            animationDelay: `${(i % 9) * 0.09}s`
          }}
        />
      ))}
    </div>
  )
}
