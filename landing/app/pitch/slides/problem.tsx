import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './problem.css'

const STATS = [
  { label: 'Causa', value: 'AVC', text: 'e também traumatismo craniano, tumor cerebral, doenças neurodegenerativas', x: 255.75 },
  { label: 'Quem vive', value: '~700 mil', text: 'brasileiros com afasia hoje', x: 697.25 },
  { label: 'Na conversa', value: 'frustração', text: 'a palavra some no meio da frase, e tentar de novo cansa', x: 1138.75 },
  { label: 'Com o fono', value: '1× semana', text: 'é a sessão, mas a palavra trava todo dia', x: 1580.25 }
]

export function Problem() {
  return (
    <div className="problem">
      <h2 className="abs rise" style={motionDelay(150)}>A palavra não chega.<br /><em>E a dor não para nela.</em></h2>
      <div className="abs condition rise" style={motionDelay(350)}>
        <img src={`${SLIDE_ASSETS}/pr3-onda.svg`} alt="" />
        <b>afasia anômica</b>
        <span>sabe o que quer dizer, mas a palavra não chega</span>
      </div>
      <img className="abs arrows" src={`${SLIDE_ASSETS}/pr3-setas.svg`} alt="" />
      {STATS.map((stat, index) => (
        <div key={stat.label} className="abs stat rise" style={{ ...motionDelay(700 + index * 160), left: stat.x - 200 }}>
          <small>{stat.label}</small>
          <b>{stat.value}</b>
          <p>{stat.text}</p>
        </div>
      ))}
      <div className="abs consequence rise" style={motionDelay(1400)}>
        <span>Aos poucos, ela conversa menos e se isola.</span>
        <i />
        <span>Em um estudo pós AVC, <b>28%</b> voltaram ao trabalho.</span>
      </div>
      <p className="abs sources rise" style={motionDelay(1550)}>Fontes: NIDCD/NIH · Rede Brasil AVC × Engelter, Stroke 2006 (estimativa) · o que ouvimos de 11 fonos e familiares · Graham, Pereira &amp; Teasell, Aphasiology 2011</p>
    </div>
  )
}
