import type { ReactNode } from 'react'
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

const HINT_TOP = 268
const HINT_HEIGHT = 148
const HINT_GAP = 14
const SIGNAL_DELAY = 250
const HINT_DELAY = 550

const INNER_ORBIT = 'M918 750C1009.13 750 1083 676.127 1083 585C1083 493.873 1009.13 420 918 420C826.873 420 753 493.873 753 585C753 676.127 826.873 750 918 750Z'
const OUTER_ORBIT = 'M918 800C1036.74 800 1133 703.741 1133 585C1133 466.259 1036.74 370 918 370C799.259 370 703 466.259 703 585C703 703.741 799.259 800 918 800Z'

const hintTop = (index: number) => HINT_TOP + index * (HINT_HEIGHT + HINT_GAP)
const HINT_PATHS = HINTS.map((_, index) => `M1038 585C1158 585 1180 ${hintTop(index) + HINT_HEIGHT / 2} 1300 ${hintTop(index) + HINT_HEIGHT / 2}`)

export function AiRole() {
  return (
    <div className="ai-role">
      <h2 className="abs rise" style={motionDelay(0)}>A IA no centro.<br /><em>Ela escolhe a ajuda certa.</em></h2>

      <svg className="abs links" width="1836" height="992" viewBox="0 0 1836 992" fill="none">
        <path className="orbit" style={motionDelay(150)} d={OUTER_ORBIT} stroke="#6B5FA8" strokeOpacity="0.12" strokeWidth="2" />
        <path className="orbit orbit--inner" style={motionDelay(200)} d={INNER_ORBIT} stroke="#6B5FA8" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 8" />
        {SIGNALS.map((signal, index) => (
          <path key={signal.name} className="stroke" style={motionDelay(SIGNAL_DELAY + 150 + index * 60)} d={signal.path} pathLength={1} stroke="#E3DEF7" strokeWidth="4" />
        ))}
        {HINT_PATHS.map((d, index) => (
          <path key={index} className="stroke" style={motionDelay(HINT_DELAY + 200 + index * 80)} d={d} pathLength={1} stroke="#6B5FA8" strokeOpacity="0.55" strokeWidth="3" />
        ))}
      </svg>

      {SIGNALS.map((signal, index) => (
        <span key={signal.name} className="abs pulse pulse--in" style={{ ...motionDelay(1300 + index * 400), offsetPath: `path('${signal.path}')` }} />
      ))}
      {HINT_PATHS.map((d, index) => (
        <span key={index} className="abs pulse pulse--out" style={{ ...motionDelay(1450 + index * 550), offsetPath: `path('${d}')` }} />
      ))}

      <img className="abs halo" style={motionDelay(100)} src={`${SLIDE_ASSETS}/ia-hub-halo.svg`} alt="" />
      <div className="abs buddy" style={motionDelay(150)}>
        <img src={`${SLIDE_ASSETS}/ia-hub-buddy.webp`} alt="Buddy, a IA do Eilo" />
      </div>
      <span className="abs ai-tag" style={motionDelay(450)}>IA</span>

      {SIGNALS.map((signal, index) => (
        <div key={signal.name} className="abs signal" style={{ ...motionDelay(SIGNAL_DELAY + index * 60), top: signal.top }}>
          <span className="num"><img src={`${SLIDE_ASSETS}/ia-hub-circulo.svg`} alt="" /><b>{index + 1}</b></span>
          <span className="node-name">{signal.name}</span>
        </div>
      ))}

      {HINTS.map((hint, index) => (
        <div key={hint.name} className="abs hint" style={{ ...motionDelay(HINT_DELAY + 100 + index * 80), top: hintTop(index) }}>
          <span className="num"><img src={`${SLIDE_ASSETS}/ia-hub-circulo-dica.svg`} alt="" /><b>{index + 1}</b></span>
          <span className="node-name">{hint.name}</span>
          <span className="hint-example">{hint.example}</span>
          {hint.visual}
        </div>
      ))}
    </div>
  )
}
