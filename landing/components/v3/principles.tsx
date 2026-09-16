import { Ban } from 'lucide-react'
import { Reveal } from './reveal'

const CARDS = [
  {
    tone: 'bg-[linear-gradient(160deg,#e4e0fb,#f7f6fb)]',
    title: 'Não manda nada para fora',
    body: 'O servidor só vê um grafo sem rótulo. Nome próprio volta com erro 400.'
  },
  {
    tone: 'bg-[linear-gradient(160deg,#f5e3f6,#f7f6fb)]',
    title: 'Não inventa ligação',
    body: 'Todo degrau cita uma aresta real. Citação que não bate é recusada.'
  },
  {
    tone: 'bg-[linear-gradient(160deg,#e8e4f7,#f7f6fb)]',
    title: 'Não pede exercício diário',
    body: 'Sem meta, sem sequência, sem notificação. Fica quieto até a palavra faltar.'
  }
]

export function Principles() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
        <h2 className="max-w-2xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
          O que o eilo não faz.
        </h2>
        <p className="max-w-[22rem] text-[0.95rem] leading-[1.7] text-[var(--v3-muted)] lg:pt-3">
          Protótipo acadêmico, ainda sem uso fora do grupo. As três linhas abaixo são garantias de
            código.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 80} className="h-full">
          <article
            className={`${card.tone} flex h-full min-h-[236px] flex-col rounded-[1.4rem] p-7`}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-white/70 text-[var(--v3-accent)]">
              <Ban className="size-[1.05rem]" />
            </span>
            <h3 className="mt-7 min-h-[2.9rem] text-[1.05rem] leading-snug font-medium tracking-[-0.025em]">
              {card.title}
            </h3>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-[#6b687a]">{card.body}</p>
          </article>
          </Reveal>
        ))}

        <Reveal delay={240} className="h-full">
        <article className="relative flex h-full min-h-[236px] flex-col justify-end overflow-hidden rounded-[1.4rem] p-7 text-white">
          <img
            src="/story/scene-photos.webp"
            alt="Mãe e filha reconhecendo alguém numa foto antiga."
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-[60%_45%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,24,0.05),rgba(16,12,24,0.7))]" />
          <p className="relative text-[0.92rem] leading-relaxed">
            A família confirma o mapa uma vez. Depois ele se mantém sozinho.
          </p>
        </article>
        </Reveal>
      </div>
    </section>
  )
}
