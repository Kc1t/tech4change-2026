import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './solution.css'

const POINTS = [
  { icon: 'list', title: 'A ajuda é progressiva', text: 'Da dica mais leve à palavra, só o necessário.' },
  { icon: 'zap', title: 'Chega no segundo em que trava', text: 'Percebe a pausa no meio da conversa.' },
  { icon: 'user', title: 'Quem diz a palavra é ela', text: 'E a fala treina a cada conversa.', active: true }
]

const DEVICES = [
  { photo: 'aparelho-celular', name: 'Só o celular', badge: 'já basta' },
  { photo: 'aparelho-pulseira', name: 'Pulseira simples', badge: 'R$ 50–150' },
  { photo: 'aparelho-relogio', name: 'Relógio', badge: 'mais fácil' }
]

export function Solution() {
  return (
    <div className="solution">
      <h2 className="abs rise" style={motionDelay(150)}>Não entregamos a palavra.<br />Reabrimos o caminho.</h2>
      <p className="abs lead rise" style={motionDelay(300)}>Uma dica de cada vez, no celular e no pulso.</p>
      <img className="abs connector rise" style={motionDelay(500)} src={`${SLIDE_ASSETS}/k2-ligacao.svg`} alt="" />
      {POINTS.map((point, index) => (
        <div key={point.icon} className={`abs point point--${index + 1} rise`} style={motionDelay(450 + index * 160)}>
          <span className="icon">
            <img className="disc" src={`${SLIDE_ASSETS}/${point.active ? 'k2-circulo-ativo' : 'k2-circulo'}.svg`} alt="" />
            <img className="symbol" src={`${SLIDE_ASSETS}/k2-icon-${point.icon}.svg`} alt="" />
          </span>
          <b>{point.title}</b>
          <small>{point.text}</small>
        </div>
      ))}
      <div className="abs scene scene--phone rise" style={motionDelay(350)}>
        <img src={`${SLIDE_ASSETS}/k2-celular.webp`} alt="Celular com o app Eilo mostrando a dica Mora em Sorocaba" />
        <span className="scene-chip"><img src={`${SLIDE_ASSETS}/k2-ponto.svg`} alt="" />No celular</span>
      </div>
      <div className="abs scene scene--wrist rise" style={motionDelay(550)}>
        <div className="photo"><img src={`${SLIDE_ASSETS}/k2-pulso.webp`} alt="Relógio no pulso vibrando com a dica Mora em Sorocaba" /></div>
        <span className="scene-chip"><img src={`${SLIDE_ASSETS}/k2-ponto.svg`} alt="" />No pulso</span>
      </div>
      <img className="abs arcs" src={`${SLIDE_ASSETS}/k2-arcos.svg`} alt="" />
      <div className="abs buzz rise" style={motionDelay(1100)}><img src={`${SLIDE_ASSETS}/k2-vibra.svg`} alt="" />2 toques = dica 2</div>
      <div className="abs compatible rise" style={motionDelay(1250)}>
        <p className="title">Funciona com o que ela tem</p>
        <div className="device-list">
          {DEVICES.map(device => (
            <div key={device.photo} className="item">
              <img src={`${SLIDE_ASSETS}/${device.photo}.webp`} alt="" />
              <b>{device.name}</b>
              <small>{device.badge}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="abs hint-card rise" style={motionDelay(900)}>
        <img src={`${SLIDE_ASSETS}/k2-buddy.webp`} alt="" />
        <div><small>Dica 2</small><b>Mora em Sorocaba</b></div>
      </div>
    </div>
  )
}
