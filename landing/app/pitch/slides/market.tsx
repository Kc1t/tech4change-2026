import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './market.css'

const TIERS = [
  { label: 'O problema inteiro', value: '~R$ 500 mi/ano', text: '700 mil pessoas com afasia × ~R$ 60/mês', x: 95 },
  { label: 'Onde a gente entra', value: '~R$ 11 mi/ano', text: '9 mil fonos de neuro adulto × ~R$ 1.200/ano', x: 674 },
  { label: 'Meta do ano 3', value: '~R$ 2,2 mi/ano', text: '~1.800 fonos assinando (20%)', x: 1250, featured: true }
]

const CUTOFFS = [
  { text: 'só o fono de neuro adulto', x: 508 },
  { text: '20% deles em 3 anos', x: 1104 }
]

const PHASES = [
  { name: 'Piloto', text: '1 clínica · ProSense', x: 150 },
  { name: 'Ano 1', text: '~90 fonos (1%)', x: 620 },
  { name: 'Ano 3', text: '~1.800 fonos (20%)', x: 1210, featured: true },
  { name: 'Depois', text: 'SUS · secretarias de saúde', x: 1690 }
]

export function MarketScale() {
  return (
    <div className="market">
      <h2 className="abs rise" style={motionDelay(150)}>Um problema de ~R$ 500 mi por ano.<br /><em>A gente entra pelo fono e cresce em fases.</em></h2>
      <svg className="abs funnel" width="1836" height="992" viewBox="0 0 1836 992" fill="none" aria-hidden>
        <path className="segment" style={motionDelay(350)} d="M55 278L620 328V628L55 678V278Z" fill="#F4F2FD" />
        <path className="segment" style={motionDelay(650)} d="M634 328L1200 378V578L634 628V328Z" fill="#E3DEF7" />
        <path className="segment" style={motionDelay(950)} d="M1214 378L1781 410V546L1214 578V378Z" fill="#6B5FA8" />
        <path className="cut" style={motionDelay(800)} d="M627 312V330" stroke="#6B5FA8" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" />
        <path className="cut" style={motionDelay(1100)} d="M1207 312V380" stroke="#6B5FA8" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" />
      </svg>
      {CUTOFFS.map((cutoff, index) => (
        <div key={cutoff.text} className="abs cutoff rise" style={{ ...motionDelay(750 + index * 300), left: cutoff.x }}>
          <img src={`${SLIDE_ASSETS}/e2-filtro.svg`} alt="" />
          {cutoff.text}
        </div>
      ))}
      {TIERS.map((tier, index) => (
        <div key={tier.label} className={`abs tier rise${tier.featured ? ' tier--featured' : ''}`} style={{ ...motionDelay(500 + index * 300), left: tier.x }}>
          <small>{tier.label}</small>
          <b>{tier.value}</b>
          <p>{tier.text}</p>
        </div>
      ))}
      <p className="abs phases-title rise" style={motionDelay(1300)}>Escala em fases</p>
      <img className="abs timeline rise" style={motionDelay(1350)} src={`${SLIDE_ASSETS}/e2-linha.svg`} alt="" />
      {PHASES.map((phase, index) => (
        <div key={phase.name} className={`abs phase rise${phase.featured ? ' phase--featured' : ''}`} style={{ ...motionDelay(1400 + index * 140), left: phase.x - 160 }}>
          <img src={`${SLIDE_ASSETS}/${phase.featured ? 'e2-ponto-ativo' : 'e2-ponto'}.svg`} alt="" />
          <b>{phase.name}</b>
          <span>{phase.text}</span>
        </div>
      ))}
      <p className="abs sources rise" style={motionDelay(1900)}>Fontes: Rede Brasil AVC × Engelter, Stroke 2006 · CFFa: 61 mil fonos, premissa de 15% em neuro adulto · ~R$ 1.200/ano = média entre o plano mensal (R$ 119) e o anual (R$ 990) · ano 1 e ano 3 são projeções</p>
    </div>
  )
}
