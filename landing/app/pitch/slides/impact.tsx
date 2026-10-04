import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './impact.css'

const TIMELINE = [
  { label: 'Hoje', value: '3 meses', className: 'row--today' },
  { label: 'Com o Eilo', value: '1 mês', className: 'row--eilo' }
]

export function Impact() {
  return (
    <div className="impact">
      <div className="abs backdrop rise" style={motionDelay(100)} />
      <div className="abs table-crop rise" style={motionDelay(200)}>
        <img src={`${SLIDE_ASSETS}/impacto-mesa.webp`} alt="Mulher sorrindo, apoiada na mesa com uma xícara de café" />
      </div>
      <img className="abs bubble-tail rise" style={motionDelay(700)} src={`${SLIDE_ASSETS}/impacto-balao-ponta.svg`} alt="" />
      <div className="abs bubble rise" style={motionDelay(700)}>
        <small>A PALAVRA VOLTOU</small>
        <b>Letícia!</b>
      </div>
      <p className="abs eyebrow rise" style={motionDelay(400)}>NOSSA META</p>
      <p className="abs headline rise" style={motionDelay(500)}>1 mês</p>
      <p className="abs lead rise" style={motionDelay(650)}>para chegar no treino que</p>
      <p className="abs lead-em serif rise" style={motionDelay(750)}>traz a fala de volta.</p>
      {TIMELINE.map((row, index) => (
        <div key={row.label} className={`abs row ${row.className} rise`} style={motionDelay(900 + index * 150)}>
          <b>{row.label}</b>
          <i style={motionDelay(1100 + index * 150)} />
          <span>{row.value}</span>
        </div>
      ))}
      <p className="abs source rise" style={motionDelay(1300)}>Meta do piloto: 20 h de treino, a faixa de maior ganho (RELEASE, Stroke 2022).</p>
    </div>
  )
}
