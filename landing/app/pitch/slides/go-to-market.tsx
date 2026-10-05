import { PITCH_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './go-to-market.css'

const MILESTONES = [
  { tone: 1, photo: 'gtm-clinica', phase: '1 · Validar', who: 'Clínicas', price: 'Piloto', note: 'valida o produto com quem trata · depois, licença por unidade com preço definido no piloto' },
  { tone: 2, photo: 'gtm-fono', phase: '2 · Liberar', who: 'Fonoaudiólogo', price: 'R$ 119/mês', note: 'quem paga é o fono: libera o uso completo para os pacientes e acompanha pelo painel' },
  { tone: 3, photo: 'gtm-familia', phase: '3 · Escalar', who: 'Família · acesso inicial', price: 'R$ 0', note: 'monta o mapa da vida e testa no celular · uso completo com acompanhamento do fono', badge: 'gtm-sus' }
]

export function GoToMarket() {
  return (
    <div className="go-to-market">
      <h2 className="abs rise" style={motionDelay(150)}>Começamos pela clínica.<br /><em>A cada etapa, chega mais gente.</em></h2>
      <p className="abs cost rise" style={motionDelay(350)}>IA custa até R$ 2,50 por paciente · sobram ~R$ 75 por fono</p>
      {MILESTONES.map((milestone, index) => (
        <div key={milestone.photo} className={`milestone milestone--${milestone.tone} rise`} style={motionDelay(400 + index * 250)}>
          <img className="photo cover" src={`${PITCH_ASSETS}/${milestone.photo}.png`} alt="" />
          <span className="phase">{milestone.phase}</span>
          {milestone.badge && <div className="sus"><img src={`${PITCH_ASSETS}/${milestone.badge}.png`} alt="SUS" /></div>}
          <div className="copy"><div className="who">{milestone.who}</div><div className="price">{milestone.price}</div><div className="note">{milestone.note}</div></div>
        </div>
      ))}
    </div>
  )
}
