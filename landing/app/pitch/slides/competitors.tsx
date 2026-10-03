import { PITCH_ASSETS, SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './competitors.css'

type Mark = boolean | string
type Kind = 'direct' | 'indirect'

const COLUMNS = ['No meio da conversa', 'Ela mesma diz a palavra', 'Usa a vida dela']
const KIND_LABEL: Record<Kind, string> = { direct: 'Direto', indirect: 'Indireto' }

const COMPETITORS: { name: string; about: string; logo: string; kind: Kind; marks: Mark[] }[] = [
  { name: 'Constant Therapy', about: '800 mil usuários', logo: 'constant-therapy', kind: 'direct', marks: [false, true, false] },
  { name: 'Lexicomix', about: 'brasileiro · R$ 69', logo: 'lexicomix', kind: 'direct', marks: [false, true, false] },
  { name: 'Northeastern', about: 'relógio · ensaio clínico', logo: 'northeastern', kind: 'direct', marks: ['no dia a dia', true, false] },
  { name: 'ChatGPT', about: 'OpenAI · modo de voz', logo: 'chatgpt', kind: 'indirect', marks: ['se chamado', false, false] },
  { name: 'Gemini', about: 'Google · no Android', logo: 'gemini', kind: 'indirect', marks: ['se chamado', false, false] }
]

const cellLeft = (column: number) => 805 + column * 330

function Cell({ mark }: { mark: Mark }) {
  if (mark === true) return <span className="yes">✓</span>
  if (mark === false) return <span className="no" />
  return <span className="note">{mark}</span>
}

export function Competitors() {
  return (
    <div className="competitors">
      <h2 className="abs rise" style={motionDelay(150)}>Diretos treinam. Indiretos respondem.<br /><em>O Eilo faz os dois na hora.</em></h2>
      {COLUMNS.map((column, index) => (
        <p key={column} className="abs column rise" style={{ ...motionDelay(400 + index * 80), left: cellLeft(index) + 144 }}>{column}</p>
      ))}
      {COMPETITORS.map((competitor, index) => (
        <div key={competitor.name} className={`abs row rise${index === COMPETITORS.length - 1 ? ' row--last' : ''}`} style={{ ...motionDelay(600 + index * 140), top: 376 + index * 78 }}>
          <span className={`brand brand--${competitor.logo}`}><img src={`${SLIDE_ASSETS}/conc-${competitor.logo}.png`} alt="" /></span>
          <b>{competitor.name}</b>
          <small>{competitor.about}</small>
          <span className={`kind kind--${competitor.kind}`}>{KIND_LABEL[competitor.kind]}</span>
          {competitor.marks.map((mark, column) => <div key={column} className="cell" style={{ left: cellLeft(column) }}><Cell mark={mark} /></div>)}
        </div>
      ))}
      <div className="abs row row--eilo" style={motionDelay(1450)}>
        <img className="eilo-brand" src={`${PITCH_ASSETS}/eilo-icon-lilas.png`} alt="" />
        <b>Eilo</b>
        <small>pista no instante do bloqueio</small>
        {COLUMNS.map((column, index) => <div key={column} className="cell" style={{ left: cellLeft(index) }}><span className="yes" style={motionDelay(1900 + index * 140)}>✓</span></div>)}
      </div>
    </div>
  )
}
