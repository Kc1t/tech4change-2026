import { SLIDE_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import './vibration.css'

const FINDINGS = [
  { title: 'Puxar a palavra ensina mais', text: 'Tentar lembrar com uma dica fixa mais do que receber pronta.', source: 'Middleton et al., 2015' },
  { title: 'Ajuda no momento certo', text: 'Intervir no instante da dificuldade é um modelo estudado em saúde digital.', source: 'Nahum-Shani et al., 2018' },
  { title: 'Já testado com afasia', text: '~80% dos chamados no relógio atendidos, no dia a dia.', source: 'Hester et al., Northeastern, 2023' }
]

export function Vibration() {
  return (
    <div className="vibration">
      <img className="abs scene" src={`${SLIDE_ASSETS}/vibracao-cena.webp`} alt="Mulher sorrindo olhando o relógio no pulso, com o celular sobre a mesa" />
      <h2 className="abs rise" style={motionDelay(150)}>A vibração<br /><em>vira treino.</em></h2>
      <p className="abs lead rise" style={motionDelay(350)}>Cada degrau tem um ritmo: 1, 2, 3 toques, e a palavra é um toque longo. O pulso chama a pessoa a tentar, em vez de alguém completar por ela.</p>

      <img className="abs line line--wrist" style={motionDelay(1000)} src={`${SLIDE_ASSETS}/vibracao-linha-pulso.svg`} alt="" />
      <img className="abs dot dot--wrist" style={motionDelay(1150)} src={`${SLIDE_ASSETS}/vibracao-ponto.svg`} alt="" />
      <div className="abs orb orb--wrist" style={motionDelay(650)}>
        <img src={`${SLIDE_ASSETS}/vibracao-bola-pulso.webp`} alt="Detalhe do relógio no pulso mostrando uma dica" />
      </div>
      <div className="abs label label--wrist rise" style={motionDelay(850)}><b>Pulso</b><span>1 · 2 · 3 toques</span></div>

      <img className="abs line line--phone" style={motionDelay(1450)} src={`${SLIDE_ASSETS}/vibracao-linha-celular.svg`} alt="" />
      <img className="abs dot dot--phone" style={motionDelay(1600)} src={`${SLIDE_ASSETS}/vibracao-ponto.svg`} alt="" />
      <div className="abs orb orb--phone" style={motionDelay(1100)}>
        <img src={`${SLIDE_ASSETS}/vibracao-bola-celular-a.webp`} alt="" />
        <img src={`${SLIDE_ASSETS}/vibracao-bola-celular-b.webp`} alt="Detalhe do celular com o app Eilo" />
      </div>
      <div className="abs label label--phone rise" style={motionDelay(1300)}><b>Celular</b><span>ou só ele, sem relógio</span></div>

      <div className="abs why rise" style={motionDelay(500)}>
        <small>Por que funciona</small>
        {FINDINGS.map((finding, index) => (
          <div key={finding.title} className="finding rise" style={motionDelay(700 + index * 160)}>
            <b>{finding.title}</b>
            <p>{finding.text}</p>
            <span>{finding.source}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
