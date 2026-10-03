import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './interviews.css'

const FINDINGS = [
  { value: '11', label: 'Quem ouvimos', text: 'fonoaudiólogos e familiares entrevistados' },
  { value: '1–2', label: 'Quem consegue tratar', text: 'sessões de fono por semana, e nada entre uma e outra' },
  { value: '0', label: 'O que existe hoje', text: 'ferramentas para o meio da conversa: prancha, caderno e apps são para a sessão' }
]

const DIVIDERS = [{ top: 492, delay: 500 }, { top: 642, delay: 680 }]

export function Interviews() {
  return (
    <div className="interviews">
      <h2 className="abs rise" style={motionDelay(150)}>Para entender o problema,<br /><em>ouvimos quem vive isso.</em></h2>
      {FINDINGS.map((finding, index) => (
        <div key={finding.value} className="abs finding rise" style={{ ...motionDelay(350 + index * 180), top: 350 + index * 150 }}>
          <strong>{finding.value}</strong>
          <div>
            <small>{finding.label}</small>
            <p>{finding.text}</p>
          </div>
        </div>
      ))}
      {DIVIDERS.map(divider => <i key={divider.top} className="abs divider rise" style={{ ...motionDelay(divider.delay), top: divider.top }} />)}
      <div className="abs session rise" style={motionDelay(450)}>
        <img className="cover" src={`${SLIDE_ASSETS}/ouvimos-sessao.webp`} alt="Fonoaudióloga conversando com um paciente idoso" />
      </div>
      <figure className="abs quote rise" style={motionDelay(800)}>
        <blockquote>“O mais difícil não é treinar depois. É ajudar no segundo em que a palavra some.”</blockquote>
        <figcaption>—  Flávia Augusta, fonoaudióloga</figcaption>
        <span>Especialista em comunicação e alimentação para adultos e idosos</span>
      </figure>
      <p className="abs takeaway rise" style={motionDelay(1100)}>O que mais ouvimos: o segundo em que a palavra some, fora da sessão.</p>
    </div>
  )
}
