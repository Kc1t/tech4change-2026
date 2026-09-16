import { Reveal } from './reveal'

const PILLARS = [
  {
    step: '01',
    title: 'O mapa se monta sozinho',
    body: 'Fotos e áudios do próprio aparelho viram um grafo de pessoas, lugares e objetos. A família confirma uma vez — e só ela sabe que aquele rosto é a Letícia.'
  },
  {
    step: '02',
    title: 'A escada, não a resposta',
    body: 'Cada degrau cita uma aresta que existe no grafo. Se o modelo inventar uma ligação, a resposta inteira é recusada antes de chegar na tela.'
  },
  {
    step: '03',
    title: 'A escada encurta',
    body: 'Destravou no degrau 4? Da próxima vez começa no 3. O indicador de sucesso é o degrau médio caindo — é uma ferramenta construída para deixar de ser necessária.'
  }
]

export function Pillars() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
      <div className="grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.step} delay={i * 110}>
            <article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-surface p-7">
              <span className="display tabular text-[2.4rem] leading-none text-brand-warm">
                {pillar.step}
              </span>
              <h3 className="mt-5 text-[1.3rem] leading-snug font-medium tracking-[-0.03em]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-dim">{pillar.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
