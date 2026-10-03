import { PITCH_ASSETS, SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './next-steps.css'

const STEPS = [
  { photo: `${PITCH_ASSETS}/pedido/clinicas.webp`, highlight: 'Piloto', rest: ' na ProSense', text: '4 semanas, com comitê de ética: os fonos da clínica ajudam a moldar o produto.', when: 'Agora', now: true, y: 202 },
  { photo: `${SLIDE_ASSETS}/prox-clinicas.webp`, highlight: 'Mais clínicas', rest: ' no teste', text: 'Levar o piloto para outras clínicas de reabilitação neurológica.', when: 'Depois do piloto', now: false, y: 398, zoom: true },
  { photo: `${PITCH_ASSETS}/pedido/fono.webp`, highlight: 'Preço', rest: ' na mesa', text: 'Fonos testando R$ 119/mês e um valor menor.', when: 'Agora', now: true, y: 594 },
  { photo: `${PITCH_ASSETS}/pedido/mentoria.webp`, highlight: 'Caminho', rest: ' regulatório', text: 'Preparar o registro para poder vender, com mentoria.', when: 'Em paralelo', now: false, y: 790 }
]

const BRANCH_DELAY = 650
const STEP_DELAY = 1100

export function NextSteps() {
  return (
    <div className="next-steps">
      <svg className="abs branches" width="1836" height="992" viewBox="0 0 1836 992" fill="none">
        {STEPS.map((step, index) => (
          <g key={step.highlight}>
            <path className="branch" style={motionDelay(BRANCH_DELAY + index * 90)} d={`M726 496C846 496 850 ${step.y} 960 ${step.y}`} pathLength={1} stroke="#E3DEF7" strokeWidth="12" strokeLinecap="round" />
            <circle className="node" style={motionDelay(BRANCH_DELAY + 650 + index * 90)} cx="960" cy={step.y} r="9" fill="#6B5FA8" />
          </g>
        ))}
      </svg>
      <div className="abs hub rise" style={motionDelay(150)}>
        <img className="buddy" src={`${SLIDE_ASSETS}/prox-buddy.webp`} alt="" />
        <h2>Os <b>próximos passos</b><br />para o Eilo crescer.</h2>
        <p className="today"><b>Hoje</b>O Eilo já roda e está em validação técnica: primeiro com pessoas sem afasia, agora indo para quem tem.</p>
        <figure className="endorsement rise" style={motionDelay(600)}>
          <blockquote>“Achei a proposta de grande relevância. Vocês identificaram um gap persistente que temos na reabilitação dos pacientes com afasia.”</blockquote>
          <figcaption><b>Flávia Augusta</b>, fonoaudióloga</figcaption>
          <span>Especialista em comunicação e alimentação para adultos e idosos</span>
        </figure>
      </div>
      {STEPS.map((step, index) => (
        <div key={step.highlight} className="abs step rise" style={{ top: step.y - 89, ...motionDelay(STEP_DELAY + index * 140) }}>
          <div className="photo"><img className={step.zoom ? 'zoom' : undefined} src={step.photo} alt="" /></div>
          <small>{String(index + 1).padStart(2, '0')}</small>
          <h3><em>{step.highlight}</em>{step.rest}</h3>
          <p>{step.text}</p>
          <span className={step.now ? 'when when--now' : 'when'}>{step.when}</span>
        </div>
      ))}
    </div>
  )
}
