import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './devices.css'

const CARDS = [
  { image: 'celulares', badge: 'já basta · qualquer celular', title: 'Só o celular', text: 'A dica aparece na tela e vibra na mão.', main: true },
  { image: 'pulseiras', badge: 'opcional · a partir de R$ 50', title: 'Uma pulseira simples', text: 'Qualquer pulseira que vibre com as notificações do celular.' },
  { image: 'relogios', badge: 'opcional · mais discreto', title: 'Um relógio', text: 'Qualquer relógio: ela sente a dica no pulso e lê de relance.' }
]

export function Devices() {
  return (
    <div className="devices">
      <h2 className="abs rise" style={motionDelay(200)}>
        Qualquer celular já basta.<br /><em>Qualquer relógio só facilita.</em>
      </h2>
      {CARDS.map((card, n) => (
        <div key={card.image} className={`abs device-card${card.main ? ' device-card--main' : ''} rise`} style={{ ...motionDelay(400 + n * 150), left: 55 + n * 586 }}>
          <div className={`device-photo device-photo--${card.image}`}>
            <img src={`${SLIDE_ASSETS}/aparelhos-${card.image}.webp`} alt="" />
          </div>
          <span className="device-badge">{card.badge}</span>
          <b>{card.title}</b>
          <p>{card.text}</p>
        </div>
      ))}
      <p className="abs ease-label rise" style={motionDelay(900)}>MAIS FACILIDADE</p>
      <img className="abs ease-arrow rise" style={motionDelay(950)} src={`${SLIDE_ASSETS}/aparelhos-seta.svg`} alt="" />
    </div>
  )
}
