import { PayloadProof } from '@/components/payload-proof'
import { Reveal } from './reveal'

const BLOCKS = [
  {
    step: '01',
    title: 'O mapa é seu, e se monta sozinho',
    body: 'As fotos e os áudios que já estão no aparelho viram um grafo de pessoas e lugares. A família confirma uma vez — ninguém preenche formulário toda semana.'
  },
  {
    step: '02',
    title: 'Cada degrau cita uma aresta',
    body: 'A dica não vem de um modelo que adivinha. Se ele inventar uma ligação que não existe no grafo, a resposta inteira é recusada antes de chegar na tela.'
  },
  {
    step: '03',
    title: 'A palavra não sai do aparelho',
    body: 'O servidor ranqueia sobre um grafo sem rótulo nenhum e devolve identificadores. Uma requisição com nome próprio volta com erro 400.'
  }
]

function InlineImage({ src, alt, position }: { src: string; alt: string; position: string }) {
  return (
    <span className="mx-1.5 inline-block h-[0.8em] w-[1.7em] translate-y-[0.06em] overflow-hidden rounded-full align-middle">
      <img src={src} alt={alt} loading="lazy" className={`size-full object-cover ${position}`} />
    </span>
  )
}

export function Why() {
  return (
    <section id="por-que" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <p className="label-caps">por que funciona</p>
        <h2 className="mt-5 max-w-4xl text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.1] font-medium tracking-[-0.035em] text-balance">
          O nome da sua neta
          <InlineImage
            src="/story/scene-granddaughter.webp"
            alt="A neta, ao lado do avô, à mesa."
            position="object-[50%_28%]"
          />
          não está nos pesos
          <InlineImage
            src="/story/scene-photos.webp"
            alt="Mãe e filha reconhecendo alguém numa foto antiga."
            position="object-[60%_45%]"
          />
          de nenhum modelo de linguagem.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {BLOCKS.map((block, i) => (
          <Reveal key={block.step} delay={i * 110}>
            <article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-surface p-7">
              <span className="display tabular text-[2.4rem] leading-none text-brand-warm">
                {block.step}
              </span>
              <h3 className="mt-5 text-[1.2rem] leading-snug font-medium tracking-[-0.03em]">
                {block.title}
              </h3>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-dim">{block.body}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={140} className="mt-4">
        <PayloadProof />
      </Reveal>
    </section>
  )
}
