import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './team.css'

const MEMBERS = [
  { id: 'kaua', name: 'Kauã Miguel', role: 'Produto & Engenharia', tags: ['IA', 'Arquitetura', 'Aplicação'] },
  { id: 'adriel', name: 'Adriel Ribeiro', role: 'Validação Clínica', tags: ['Clínicas', 'Entrevistas', 'Evidência'] },
  { id: 'alessandro', name: 'Alessandro Alves', role: 'Comunicação & Design', tags: ['Design', 'Identidade'] }
]

const WAVE = [12, 24, 36, 24, 12]

export function Team() {
  return (
    <div className="team">
      <h2 className="abs rise" style={motionDelay(150)}>Quem está por trás.<br /><em>Cada um com uma frente.</em></h2>
      <div className="abs note rise" style={motionDelay(350)}>
        <div className="wave">{WAVE.map((height, index) => <i key={index} style={{ height, left: index * 9 }} />)}</div>
        <p>O problema é clínico, técnico<br />e de confiança.</p>
      </div>
      <div className="abs members">
        {MEMBERS.map((member, index) => (
          <div key={member.id} className={`member member--${member.id} rise`} style={motionDelay(500 + index * 150)}>
            <div className="photo"><img src={`${SLIDE_ASSETS}/time-${member.id}.webp`} alt={member.name} /></div>
            <div className="name"><b>{member.name}</b><span>{member.role}</span></div>
            <div className="tags">{member.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
