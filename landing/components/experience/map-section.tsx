import { Reveal } from './reveal'

function InlineImage({
  src,
  alt,
  className
}: {
  src: string
  alt: string
  className: string
}) {
  return (
    <span className="mx-1.5 inline-block h-[0.8em] w-[1.7em] translate-y-[0.06em] overflow-hidden rounded-full align-middle">
      <img src={src} alt={alt} loading="lazy" className={`size-full object-cover ${className}`} />
    </span>
  )
}

export function MapSection() {
  return (
    <section id="o-mapa" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <p className="label-caps">
          como funciona
        </p>
        <h2 className="mt-5 max-w-4xl text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.1] font-medium tracking-[-0.035em] text-balance">
          O nome da sua neta
          <InlineImage
            src="/story/scene-granddaughter.webp"
            alt="A neta, ao lado do avô, à mesa."
            className="object-[50%_28%]"
          />
          não está nos pesos
          <InlineImage
            src="/story/scene-photos.webp"
            alt="Mãe e filha reconhecendo alguém numa foto antiga."
            className="object-[60%_45%]"
          />
          de nenhum modelo de linguagem.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="relative">
          <div className="relative h-[420px] overflow-hidden rounded-[2rem] sm:h-[520px]">
            <img
              src="/story/scene-photos.webp"
              alt="Duas mulheres no sofá, apontando para uma foto antiga na tela do celular."
              loading="lazy"
              className="size-full object-cover object-[46%_45%]"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(20,14,12,0.8)] to-transparent" />

            <div className="glass-light absolute right-5 bottom-5 left-5 rounded-2xl p-5 sm:right-auto sm:max-w-xs">
              <p className="label-caps">
                a família confirma uma vez
              </p>
              <p className="mt-2 text-[0.95rem] leading-snug">
                Só ela sabe que aquele rosto é a Letícia. Depois disso, ninguém preenche formulário
                nenhum.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col justify-center gap-6">
          <Reveal delay={120}>
            <p className="text-[1.05rem] leading-relaxed text-dim">
              Nenhuma IA do mundo sabe quem é a Letícia. Só um índice pessoal resolve nome próprio —
              e é por isso que o grafo precisa se montar sozinho, das fotos e dos áudios que já
              estão no aparelho da própria pessoa.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[1.05rem] leading-relaxed text-dim">
              Visão computacional agrupa os rostos. Os metadados da foto dão lugar e data. A família
              confirma uma vez, e o mapa passa a existir — que é exatamente por onde produtos
              parecidos são abandonados: o formulário de toda semana.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="display text-[1.5rem] leading-snug">
                “A palavra não sumiu. O caminho até ela sumiu.”
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
