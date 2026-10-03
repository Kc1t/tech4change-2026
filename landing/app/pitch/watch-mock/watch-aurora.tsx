import { useEffect, useRef } from 'react'

type Layer = { base: number; amp: number; boost: number; freq: number; drift: number; alpha: number; colors: string[]; stops: number[] }

const LILAC = '#B9A3F7'
const PINK = '#EFB6EC'
const SKY = '#A9DCFF'
const BLUSH = '#FFE0F2'
const ORB_BASE = '#E7DFFB'

const LAYERS: Layer[] = [
  { base: 0.15, amp: 0.07, boost: 0.09, freq: 0.9, drift: 0.00019, alpha: 150, colors: [BLUSH, ORB_BASE, LILAC], stops: [0, 0.5, 1] },
  { base: 0.32, amp: 0.075, boost: 0.14, freq: 1.2, drift: -0.00027, alpha: 200, colors: [LILAC, BLUSH, PINK], stops: [0, 0.55, 1] },
  { base: 0.56, amp: 0.065, boost: 0.18, freq: 1.5, drift: 0.00034, alpha: 216, colors: [PINK, LILAC, SKY], stops: [0, 0.5, 1] },
  { base: 0.8, amp: 0.055, boost: 0.2, freq: 1.8, drift: -0.00044, alpha: 236, colors: [LILAC, SKY, LILAC], stops: [0, 0.55, 1] }
]

const BAND_W = 100
const BAND_H = 36
const STEPS = 56
const HOLD_MS = 900

function wavePath(layer: Layer, now: number, level: number) {
  const amplitude = (layer.amp + level * layer.boost) * BAND_H
  const phase = now * layer.drift
  let d = ''
  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS
    const wave = Math.sin(u * Math.PI * layer.freq * 2 + phase) * 0.78 + Math.sin(u * Math.PI * layer.freq * 3.4 + phase * 1.6) * 0.22
    const y = layer.base * BAND_H - wave * amplitude
    d += `${i === 0 ? 'M' : 'L'}${(u * BAND_W).toFixed(2)} ${y.toFixed(2)}`
  }
  return `${d}L${BAND_W} ${BAND_H}L0 ${BAND_H}Z`
}

export type Surge = { to: number; at: number }

export function WatchAurora({ surge }: { surge: Surge }) {
  const paths = useRef<(SVGPathElement | null)[]>([])
  const pulse = useRef(surge)

  useEffect(() => {
    pulse.current = surge
  }, [surge])

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let level = 0
    let frame = 0
    const tick = () => {
      const { to, at } = pulse.current
      const target = performance.now() - at > HOLD_MS ? 0 : to
      level += (target - level) * 0.16
      const now = still ? 0 : Date.now() % 1_000_000
      LAYERS.forEach((layer, n) => paths.current[n]?.setAttribute('d', wavePath(layer, now, level)))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg className="wm-aurora" viewBox={`0 0 ${BAND_W} ${BAND_H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        {LAYERS.map((layer, n) => (
          <linearGradient key={n} id={`wm-aurora-${n}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={BAND_W} y2={BAND_H * 0.5}>
            {layer.colors.map((color, s) => <stop key={s} offset={layer.stops[s]} stopColor={color} />)}
          </linearGradient>
        ))}
      </defs>
      {LAYERS.map((layer, n) => (
        <path key={n} ref={el => { paths.current[n] = el }} fill={`url(#wm-aurora-${n})`} fillOpacity={layer.alpha / 255} />
      ))}
    </svg>
  )
}
