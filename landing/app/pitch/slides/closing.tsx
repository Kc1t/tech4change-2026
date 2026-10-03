import { PITCH_ASSETS, SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './closing.css'

export function Closing() {
  return (
    <div className="closing">
      <div className="abs scene scene--watch rise" style={motionDelay(100)}><img src={`${SLIDE_ASSETS}/closing-watch.webp`} alt="" /></div>
      <div className="abs scene scene--phone rise" style={motionDelay(250)}><img src={`${SLIDE_ASSETS}/impacto-telefone.webp`} alt="" /></div>
      <div className="abs qr rise" style={motionDelay(450)}>
        <img src={`${SLIDE_ASSETS}/fecho-qr.png`} alt="QR code para eilo.kc1t.com" />
        <small>EXPERIMENTE A ESCADA</small>
        <b>eilo.kc1t.com</b>
      </div>
      <img className="abs buddy rise" style={motionDelay(800)} src={`${SLIDE_ASSETS}/buddy-looking.webp`} alt="" />
      <p className="abs motto rise" style={motionDelay(950)}>O caminho<br /><em>até a palavra.</em></p>
      <img className="abs wordmark rise" style={motionDelay(1100)} src={`${PITCH_ASSETS}/app/wordmark.png`} alt="eilo" />
    </div>
  )
}
