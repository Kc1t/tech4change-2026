'use client'

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './ai-role.css'

const SIGNALS = [
  { name: 'Travada', top: 342, path: 'M540 385C680 385 700 585 798 585' },
  { name: 'Família', top: 542, path: 'M540 585C680 585 700 585 798 585' },
  { name: 'Histórico', top: 742, path: 'M540 785C680 785 700 585 798 585' }
]

const HINTS: { name: string; example: string; visual: ReactNode }[] = [
  {
    name: 'Significado',
    example: '“É da sua família”',
    visual: <img className="example" src={`${SLIDE_ASSETS}/ia-hub-familia.webp`} alt="Avó sorrindo ao lado do neto, olhando o celular em família" />
  },
  {
    name: 'Contexto',
    example: '“Mora em Sorocaba”',
    visual: <img className="example" src={`${SLIDE_ASSETS}/ia-hub-exemplo.webp`} alt="Rua arborizada com casas brancas e ipês floridos em Sorocaba" />
  },
  {
    name: 'Som do começo',
    example: '“Começa com Le…”',
    visual: <span className="example example--word"><b>Le</b><i>…</i></span>
  },
  {
    name: 'A palavra',
    example: '“Letícia”',
    visual: <span className="example example--word"><b>Le</b>tícia</span>
  }
]

const HINT_TOP = 296
const HINT_CLOSED = 86
const HINT_OPEN = 276
const HINT_GAP = 14
const SIGNAL_DELAY = 250
const HINT_DELAY = 550
const HIGHLIGHT_MS = 1100

const INNER_ORBIT = 'M918 750C1009.13 750 1083 676.127 1083 585C1083 493.873 1009.13 420 918 420C826.873 420 753 493.873 753 585C753 676.127 826.873 750 918 750Z'
const OUTER_ORBIT = 'M918 800C1036.74 800 1133 703.741 1133 585C1133 466.259 1036.74 370 918 370C799.259 370 703 466.259 703 585C703 703.741 799.259 800 918 800Z'

const hintTop = (index: number, open: number) => HINT_TOP + index * (HINT_CLOSED + HINT_GAP) + (open < index ? HINT_OPEN - HINT_CLOSED : 0)
const hintPath = (y: number) => `M1038 585C1158 585 1180 ${y} 1300 ${y}`
const pathStyle = (d: string) => ({ d: `path('${d}')` }) as CSSProperties

export function AiRole() {
  const [open, setOpen] = useState(1)
  const [touched, setTouched] = useState(false)
  const [highlight, setHighlight] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const openHint = (index: number) => (event: MouseEvent) => {
    event.stopPropagation()
    setTouched(true)
    setOpen(index)
  }

  const flashSignal = (index: number) => (event: MouseEvent) => {
    event.stopPropagation()
    setHighlight(index)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS)
  }

  const paths = HINTS.map((_, index) => hintPath(hintTop(index, open) + 44))
  const activePath = paths[open]

  return (
    <div className="ai-role">
      <h2 className="abs rise" style={motionDelay(0)}>A IA no centro.<br /><em>Ela escolhe a ajuda certa.</em></h2>

      <svg className="abs links" width="1836" height="992" viewBox="0 0 1836 992" fill="none">
        <defs>
          {paths.map((d, index) => (
            <mask key={index} id={`ai-role-mask-${index}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1836" height="992">
              <path className="stroke curve" style={{ ...motionDelay(HINT_DELAY + index * 60), ...pathStyle(d) }} d={d} pathLength={1} stroke="#fff" strokeWidth="10" />
            </mask>
          ))}
        </defs>
        <path className="orbit" style={motionDelay(150)} d={OUTER_ORBIT} stroke="#6B5FA8" strokeOpacity="0.12" strokeWidth="2" />
        <path className="orbit orbit--inner" style={motionDelay(200)} d={INNER_ORBIT} stroke="#6B5FA8" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 8" />
        {SIGNALS.map((signal, index) => (
          <path key={signal.name} className={`stroke signal-line${highlight === index ? ' signal-line--on' : ''}`} style={motionDelay(SIGNAL_DELAY + 150 + index * 60)} d={signal.path} pathLength={1} stroke="#E3DEF7" strokeWidth="4" />
        ))}
        {paths.map((d, index) => (
          <path key={index} className="curve" style={pathStyle(d)} d={d} mask={`url(#ai-role-mask-${index})`} stroke="#E3DEF7" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
        ))}
        <path className="stroke curve" style={{ ...motionDelay(HINT_DELAY + 200), ...pathStyle(activePath) }} d={activePath} pathLength={1} stroke="#6B5FA8" strokeWidth="4" />
      </svg>

      {SIGNALS.map((signal, index) => (
        <span key={signal.name} className="abs pulse pulse--in" style={{ ...motionDelay(1300 + index * 400), offsetPath: `path('${signal.path}')` }} />
      ))}
      <span key={open} className="abs pulse pulse--out" style={{ ...motionDelay(touched ? 350 : 1450), offsetPath: `path('${activePath}')` }} />

      <img className="abs halo" style={motionDelay(100)} src={`${SLIDE_ASSETS}/ia-hub-halo.svg`} alt="" />
      <div className="abs buddy" style={motionDelay(150)}>
        <img src={`${SLIDE_ASSETS}/ia-hub-buddy.webp`} alt="Buddy, a IA do Eilo" />
      </div>
      <span className="abs ai-tag" style={motionDelay(450)}>IA</span>

      {SIGNALS.map((signal, index) => (
        <div
          key={signal.name}
          className={`abs signal${highlight === index ? ' signal--on' : ''}`}
          style={{ ...motionDelay(SIGNAL_DELAY + index * 60), top: signal.top }}
          onClick={flashSignal(index)}
        >
          <span className="num"><img src={`${SLIDE_ASSETS}/ia-hub-circulo.svg`} alt="" /><b>{index + 1}</b></span>
          <span className="node-name">{signal.name}</span>
        </div>
      ))}

      {HINTS.map((hint, index) => (
        <div
          key={hint.name}
          className={`abs hint${open === index ? ' hint--active' : ''}`}
          style={{ ...motionDelay(HINT_DELAY + 100 + index * 60), top: hintTop(index, open) }}
          onClick={openHint(index)}
        >
          <span className="num"><img src={`${SLIDE_ASSETS}/ia-hub-circulo-dica.svg`} alt="" /><b>{index + 1}</b></span>
          <span className="node-name">{hint.name}</span>
          <span className="hint-example">{hint.example}</span>
          {hint.visual}
        </div>
      ))}
    </div>
  )
}
