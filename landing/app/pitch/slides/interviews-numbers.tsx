import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './interviews-numbers.css'

const NUMBERS = [
  { label: 'QUEM OUVIMOS', value: '11', lines: ['fonos e familiares', 'entrevistados'] },
  { label: 'QUEM CONSEGUE TRATAR', value: '1–2', lines: ['sessões por semana,', 'e nada no meio'] },
  { label: 'O QUE EXISTE HOJE', value: '0', lines: ['ferramentas para o', 'meio da conversa'] }
]

export function InterviewsNumbers() {
  return (
    <div className="heard">
      <div className="abs backdrop rise" style={motionDelay(200)} />
      <img className="abs therapist rise" style={motionDelay(300)} src={`${SLIDE_ASSETS}/ouvimos-fono-recorte.webp`} alt="Fonoaudióloga falando" />
      <p className="abs quote-mark serif rise" style={motionDelay(250)}>“</p>
      <p className="abs quote rise" style={motionDelay(350)}>
        O mais difícil não é treinar depois. <em>É ajudar no segundo em que a palavra some.</em>
      </p>
      <div className="abs author rise" style={motionDelay(500)}>
        <b>Flávia Augusta</b>
        <span>Fonoaudióloga, especialista em comunicação de adultos e idosos</span>
      </div>
      {NUMBERS.map((number, n) => (
        <div key={number.value} className="abs figure rise" style={{ ...motionDelay(650 + n * 120), left: 55 + n * 323.33 }}>
          <small>{number.label}</small>
          <strong>{number.value}</strong>
          <span>{number.lines[0]}<br />{number.lines[1]}</span>
        </div>
      ))}
      <p className="abs sources rise" style={motionDelay(900)}>Entrevistas da equipe, setembro de 2026 · foto ilustrativa</p>
    </div>
  )
}
