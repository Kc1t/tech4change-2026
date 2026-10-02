'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { usePrefersReducedMotion } from './use-reduced-motion'

const BACKDROPS = [
  { id: 'nuvens', label: 'Nuvens', veil: '', frame: 'object-bottom sm:origin-top sm:scale-[1.22] [filter:brightness(0.93)_saturate(1.6)_contrast(1.12)] max-sm:top-0 max-sm:h-full max-sm:[mask-image:none]' },
  { id: 'seda', label: 'Seda', veil: 'v3-veil-soft', frame: 'object-bottom' },
  { id: 'orbe', label: 'Orbe', veil: 'v3-veil-soft', frame: 'object-bottom sm:origin-top sm:scale-[1.16]' },
  { id: 'fios', label: 'Fios', veil: 'v3-veil-soft', frame: 'object-bottom' },
  { id: 'ceu', label: 'Céu', veil: 'v3-veil-sky', frame: 'object-bottom' },
  { id: 'avo', label: 'Avó', veil: 'v3-veil-side', frame: 'object-[56%_50%] sm:object-[80%_50%]', align: 'left' },
  { id: 'conversa', label: 'Conversa', veil: 'v3-veil-top', frame: 'object-[69%_100%] sm:object-[50%_100%] sm:translate-y-[26%] sm:[mask-image:linear-gradient(to_bottom,transparent,black_30%)]!' },
  { id: 'pulso', label: 'Pulso', veil: 'v3-veil-side', frame: 'object-[56%_50%] sm:object-[80%_50%]', align: 'left' },
  { id: 'fono', label: 'Fono', veil: 'v3-veil-side', frame: 'object-[56%_50%] sm:object-[80%_50%]', align: 'left' }
] as const

type BackdropId = (typeof BACKDROPS)[number]['id']

const STORAGE_KEY = 'eilo.hero.fundo'

function isBackdrop(value: string | null): value is BackdropId {
  return BACKDROPS.some(backdrop => backdrop.id === value)
}

function initialBackdrop(): BackdropId {
  const fromQuery = new URLSearchParams(window.location.search).get('fundo')
  if (isBackdrop(fromQuery)) return fromQuery
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isBackdrop(saved)) return saved
  } catch {}
  return BACKDROPS[0].id
}

const listeners = new Set<() => void>()
let chosen: BackdropId | null = null

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function snapshot(): BackdropId {
  chosen ??= initialBackdrop()
  return chosen
}

function choose(id: BackdropId) {
  chosen = id
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {}
  listeners.forEach(onChange => onChange())
}

export function HeroBackdrop() {
  const still = usePrefersReducedMotion()
  const current = useSyncExternalStore(subscribe, snapshot, () => BACKDROPS[0].id)
  const videos = useRef(new Map<BackdropId, HTMLVideoElement>())
  const layer = useRef<HTMLDivElement>(null)
  const chosenBackdrop = BACKDROPS.find(backdrop => backdrop.id === current)
  const align = chosenBackdrop && 'align' in chosenBackdrop ? chosenBackdrop.align : 'center'

  useEffect(() => {
    const section = layer.current?.closest('section')
    if (section) section.dataset.align = align
  }, [align])

  useEffect(() => {
    videos.current.forEach((video, id) => {
      if (id === current && !still) void video.play().catch(() => {})
      else video.pause()
    })
  }, [current, still])

  const veil = chosenBackdrop?.veil

  return (
    <>
      <div ref={layer} aria-hidden="true" className="absolute inset-0 -z-10 bg-[#efeaf8]">
        {BACKDROPS.map(backdrop => (
          <video
            key={backdrop.id}
            ref={node => {
              if (node) videos.current.set(backdrop.id, node)
              else videos.current.delete(backdrop.id)
            }}
            className={`absolute inset-x-0 bottom-0 h-[46%] w-full object-cover transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,transparent,black_40%)] sm:top-0 sm:h-full sm:[mask-image:none] ${backdrop.frame}`}
            style={{ opacity: backdrop.id === current ? 1 : 0 }}
            src={`/hero/${backdrop.id}.mp4`}
            poster={`/hero/${backdrop.id}.webp`}
            preload={backdrop.id === current ? 'auto' : 'none'}
            muted
            loop
            playsInline
          />
        ))}
        <div className={`${veil} absolute inset-0 transition-[background] duration-700`} />
      </div>

      <div className="v3-badge-surface absolute bottom-4 left-4 z-30 flex max-w-[calc(100%-6rem)] flex-wrap items-center gap-1 rounded-2xl p-1 pl-3 backdrop-blur-md sm:bottom-5 sm:left-5">
        <span className="mr-1 text-[0.7rem] font-medium text-[#6f6c7c]">Fundo</span>
        {BACKDROPS.map(backdrop => (
          <button
            key={backdrop.id}
            type="button"
            onClick={() => choose(backdrop.id)}
            aria-pressed={backdrop.id === current}
            className={`rounded-full px-2.5 py-1 text-[0.72rem] transition-colors ${
              backdrop.id === current
                ? 'bg-white font-medium text-[var(--v3-ink)] shadow-[0_1px_3px_rgba(60,40,110,0.12)]'
                : 'text-[#6f6c7c] hover:text-[var(--v3-ink)]'
            }`}
          >
            {backdrop.label}
          </button>
        ))}
      </div>
    </>
  )
}
