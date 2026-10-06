import { useEffect, useState } from 'react'

const LIMIT_MS = 5 * 60_000
const WARN_MS = 30_000
const TIMER_KEY = 'eilo-pitch-timer'

type Clock = { startedAt: number | null; banked: number }

const STOPPED: Clock = { startedAt: null, banked: 0 }

function stored(): Clock {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(TIMER_KEY) ?? 'null') as Partial<Clock> | null
    if (!raw || typeof raw.banked !== 'number') return STOPPED
    return { startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : null, banked: raw.banked }
  } catch {
    return STOPPED
  }
}

function label(left: number): string {
  const seconds = Math.ceil(Math.abs(left) / 1000)
  return `${left < 0 ? '+' : ''}${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function DeckTimer({ moved }: { moved: boolean }) {
  const [clock, setClock] = useState<Clock>(STOPPED)
  const [now, setNow] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setClock(stored())
    setNow(Date.now())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      window.sessionStorage.setItem(TIMER_KEY, JSON.stringify(clock))
    } catch {}
  }, [clock, loaded])

  useEffect(() => {
    if (loaded && moved) setClock(current => (current.startedAt === null && current.banked === 0 ? { startedAt: Date.now(), banked: 0 } : current))
  }, [moved, loaded])

  useEffect(() => {
    if (clock.startedAt === null) return
    const tick = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(tick)
  }, [clock.startedAt])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'KeyT' || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      event.preventDefault()
      setNow(Date.now())
      if (event.shiftKey) setClock(STOPPED)
      else setClock(current => (current.startedAt === null ? { startedAt: Date.now(), banked: current.banked } : { startedAt: null, banked: current.banked + Date.now() - current.startedAt }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const running = clock.startedAt !== null
  const elapsed = clock.banked + (clock.startedAt === null ? 0 : Math.max(0, now - clock.startedAt))
  const left = LIMIT_MS - elapsed
  const tone = left <= 0 ? 'over' : left <= WARN_MS ? 'warn' : running ? 'on' : 'idle'

  return (
    <div className={`deck-timer deck-timer--${tone}`} role="timer" aria-label="Tempo restante do pitch">
      {label(left)}
      {!running && elapsed > 0 && <span>pausado</span>}
    </div>
  )
}
