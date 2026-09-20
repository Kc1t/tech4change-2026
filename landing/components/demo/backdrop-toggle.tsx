'use client'

export type Backdrop = 'wave' | 'orb'

const WAVE_PATH = 'M3 12h2.2M8 7.5v9M12 4.5v15M16 8.5v7M20.8 12H19'
const ORB_PATH = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'
const ORB_MERIDIAN = 'M12 3c-3 2.6-3 13.4 0 18M12 3c3 2.6 3 13.4 0 18M3.2 12h17.6'

const OPTIONS: ReadonlyArray<{ value: Backdrop; label: string; path: string }> = [
  { value: 'wave', label: 'Fundo em onda', path: WAVE_PATH },
  { value: 'orb', label: 'Fundo em orbe', path: `${ORB_PATH} ${ORB_MERIDIAN}` }
]

export function BackdropToggle({
  backdrop,
  onBackdrop
}: {
  backdrop: Backdrop
  onBackdrop: (backdrop: Backdrop) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Fundo da tela"
      className="relative flex rounded-full border border-[var(--v3-line)] bg-white/70"
    >
      <span
        aria-hidden="true"
        className={`absolute top-0 left-0 size-10 rounded-full bg-white shadow-[0_6px_16px_-10px_rgba(70,55,120,0.9)] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
          backdrop === 'orb' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === backdrop}
          aria-label={option.label}
          title={option.label}
          onClick={() => onBackdrop(option.value)}
          className={`relative z-10 grid size-10 place-items-center rounded-full transition-colors duration-300 ${
            option.value === backdrop ? 'text-[var(--v3-accent)]' : 'text-[#b6b0c6]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={option.path} />
          </svg>
        </button>
      ))}
    </div>
  )
}
