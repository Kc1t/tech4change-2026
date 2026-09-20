import { Reveal } from './reveal'

const CARDS = [
  {
    src: '/story/scene-stuck.webp',
    alt: 'Um homem à mesa, parado no meio de uma frase.',
    position: 'object-[50%_35%]',
    title: 'No segundo em que trava',
    body: 'A palavra some no meio da conversa. É esse segundo que o eilo atende, não o exercício da semana que vem.'
  },
  {
    src: '/art/phone-desk.webp',
    alt: 'Um celular na mesa de mármore, ao lado do café, com a tela do eilo esperando a palavra.',
    position: 'object-[50%_45%]',
    title: 'No dia a dia inteiro',
    body: 'O celular na mesa ou no bolso escuta e percebe a pausa sozinho. Ninguém precisa desbloquear nem apertar nada.'
  },
  {
    src: '/story/scene-therapist.webp',
    alt: 'Uma fonoaudióloga no consultório, olhando o painel da semana.',
    position: 'object-[30%_40%]',
    title: 'Na sessão de quarta',
    body: 'A sessão mostra a quarta-feira. O painel mostra os outros seis dias, com número e não com lembrança.'
  }
]

export function Journey() {
  return (
    <section id="jornada" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <Reveal>
        <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
          Do segundo que trava
          <br />
          até a sessão de quarta-feira.
        </h2>
        <p className="mt-5 max-w-[42rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
          Não é um app de exercícios para fazer todo dia às oito da manhã. É uma ferramenta para um
          segundo, o segundo em que a palavra trava no meio de uma conversa de verdade.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 80}>
            <article className="relative flex aspect-[3/4] items-end overflow-hidden rounded-[1.5rem] p-7 text-white">
              <img
                src={card.src}
                alt={card.alt}
                loading="lazy"
                className={`absolute inset-0 size-full object-cover ${card.position}`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,24,0)_38%,rgba(16,12,24,0.34)_62%,rgba(16,12,24,0.82)_100%)]" />
              <div className="relative">
                <h3 className="text-[1.25rem] leading-snug font-medium tracking-[-0.025em]">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[0.9rem] leading-relaxed text-white/80">{card.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
