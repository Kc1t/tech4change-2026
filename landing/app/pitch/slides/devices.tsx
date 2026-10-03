import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './devices.css'

const DEVICES = [
  { photo: 'aparelho-celular', name: 'Só o celular', badge: 'já basta · qualquer celular', text: 'A escada inteira roda no celular: a dica na tela e a vibração na mão.' },
  { photo: 'aparelho-pulseira', name: 'Uma pulseira simples', badge: 'opcional · R$ 50–150', text: 'Qualquer pulseira ou relógio com bluetooth e vibração recebe o aviso.' },
  { photo: 'aparelho-relogio', name: 'Um relógio', badge: 'opcional · mais discreto', text: 'Ela sente a dica no pulso e lê de relance, sem tirar o celular do bolso.' }
]

export function Devices() {
  return (
    <div className="devices">
      <h2 className="abs rise" style={motionDelay(150)}>O celular já basta.<br /><em>O relógio é opcional e só facilita.</em></h2>
      <div className="abs cards">
        {DEVICES.map((device, index) => (
          <div key={device.photo} className={`device rise${index === 0 ? ' device--featured' : ''}`} style={motionDelay(350 + index * 180)}>
            <div className="photo"><img src={`${SLIDE_ASSETS}/${device.photo}.webp`} alt="" /><span className="badge">{device.badge}</span></div>
            <b>{device.name}</b>
            <p>{device.text}</p>
          </div>
        ))}
      </div>
      <div className="abs convenience rise" style={motionDelay(950)}>
        <span>mais facilidade</span>
        <i />
      </div>
      <p className="abs note rise" style={motionDelay(1100)}>Nenhum aparelho extra é pré-requisito. Cada um só deixa a ajuda mais à mão.</p>
    </div>
  )
}
