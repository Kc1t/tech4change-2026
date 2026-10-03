import { FileText, Lock, Settings, Users } from 'lucide-react'
import { PITCH_ASSETS } from '../deck/assets'
import { PATIENT } from './data'

export function Sidebar({ live }: { live: boolean }) {
  return (
    <aside className="cd-side">
      <div className="cd-brand">
        <img src={`${PITCH_ASSETS}/eilo-logo-lilas2.png`} alt="eilo" />
        <span className="cd-brand-sep" />
        <span>Painel do fono</span>
      </div>
      <nav className="cd-nav">
        <span className="on"><Users />Pacientes</span>
        <span><FileText />Relatórios<em>em breve</em></span>
        <span><Settings />Ajustes<em>em breve</em></span>
      </nav>
      <p className="cd-caps">Pacientes · 1</p>
      <div className="cd-patient">
        <span className="cd-patient-photo">
          <img className="cd-avatar" src={PATIENT.photo} alt="" />
          {live && <span className="cd-dot-wrap"><span className="cd-live-dot" /></span>}
        </span>
        <span>
          <b>{PATIENT.name}</b>
          <small>{live ? 'ativo agora' : 'há 2 min'} · {PATIENT.events} eventos</small>
        </span>
      </div>
      <p className="cd-lock"><Lock />Os nomes dos pacientes ficam só neste computador. O servidor conhece apenas códigos.</p>
      <div className="cd-me">
        <img src="/fono/voce.webp" alt="" />
        <span><b>Você</b><small>Fonoaudióloga</small></span>
      </div>
    </aside>
  )
}
