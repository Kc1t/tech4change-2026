import { Reveal } from './reveal'

const ROWS = [
  { label: 'bloqueios fora da sessão', value: '86' },
  { label: 'degrau médio, esta semana', value: '2,4' },
  { label: 'degrau médio, há um mês', value: '3,6' }
]

export function Clinician() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src="/story/scene-therapist.webp"
            alt="Uma fonoaudióloga no consultório, olhando o painel da semana no notebook."
            loading="lazy"
            className="h-[520px] w-full object-cover object-[30%_center] sm:h-[600px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,14,12,0.86)] via-[rgba(20,14,12,0.25)] to-transparent lg:bg-gradient-to-l lg:from-[rgba(20,14,12,0.9)] lg:via-[rgba(20,14,12,0.45)]" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:inset-y-0 lg:left-auto lg:flex lg:w-[46%] lg:flex-col lg:justify-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-white/55 uppercase">
              para o fonoaudiólogo
            </p>
            <h2 className="mt-4 text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.05] font-medium tracking-[-0.035em] text-white text-balance">
              Oitenta e seis bloqueios que
              <span className="display italic"> aconteceram fora da sessão.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-white/70">
              A sessão de quarta mostra o que a pessoa consegue numa sala, com um profissional ao
              lado. O painel mostra o que ela consegue no domingo, na cozinha, com a família em
              volta — e quantos degraus precisou.
            </p>

            <dl className="glass-dark mt-7 max-w-sm rounded-2xl p-5">
              {ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-4 py-2.5 ${
                    i > 0 ? 'border-t border-white/12' : ''
                  }`}
                >
                  <dt className="text-[0.82rem] text-white/60">{row.label}</dt>
                  <dd className="display tabular text-[1.6rem] leading-none text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-faint">
          A quantidade de degraus é uma configuração do próprio fonoaudiólogo: de zero — entrega
          direta, modo conversa — até a escada inteira, modo treino. Quem decide se aquilo é prótese
          ou terapia naquela semana é ele, não o aplicativo.
        </p>
      </Reveal>
    </section>
  )
}
