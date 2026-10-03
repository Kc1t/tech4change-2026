import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './impact.css'

const STATS = [
  { value: '4+ dias', lines: ['de terapia por semana:', 'o que a diretriz recomenda'] },
  { value: '1–2', lines: ['sessões de fono por', 'semana: o que existe hoje'] },
  { value: '7 dias', lines: ['com possibilidade de praticar', 'entre as sessões'] },
  { value: '4 → 1', lines: ['projeção: o degrau médio cair', 'com o uso · medir no piloto'], goal: true }
]

export function Impact() {
  return (
    <div className="impact">
      <h2 className="abs rise" style={motionDelay(150)}>Mais prática, <em>entre sessões.</em></h2>
      <div className="abs stats">
        {STATS.map((stat, index) => (
          <div key={stat.value} className={`stat rise${stat.goal ? ' stat--goal' : ''}`} style={motionDelay(350 + index * 120)}>
            <b>{stat.value}</b>
            <span>{stat.lines[0]}<br />{stat.lines[1]}</span>
          </div>
        ))}
      </div>
      <p className="abs sources rise" style={motionDelay(850)}>Diretriz europeia de reabilitação da afasia (ESO, 2025) · RELEASE, Stroke 2022 · Brady et al., Cochrane 2016</p>
      <div className="abs tile tile--talk rise" style={motionDelay(700)}>
        <img className="cover" src={`${SLIDE_ASSETS}/impacto-telefone.webp`} alt="" />
        <div className="gradient" />
        <b>A conversa é a meta</b>
        <p>Queremos reduzir a ajuda necessária para encontrar a palavra. Essa evolução será medida no piloto.</p>
      </div>
      <div className="abs tile tile--lunch rise" style={motionDelay(850)}>
        <img src={`${SLIDE_ASSETS}/impacto-almoco.webp`} alt="" />
      </div>
      <div className="abs tile tile--therapist rise" style={motionDelay(1000)}>
        <img src={`${SLIDE_ASSETS}/impacto-telas.webp`} alt="" />
        <b>Complementa o tratamento</b>
        <p>A prática pode continuar no dia a dia, enquanto o fono acompanha a evolução pelo painel.</p>
      </div>
    </div>
  )
}
