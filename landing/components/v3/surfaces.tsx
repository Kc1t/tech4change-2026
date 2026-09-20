import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { Headphones, Smartphone, Watch } from 'lucide-react'
import { Reveal } from './reveal'

const CARDS = [
  {
    file: 'art/watch-3d',
    icon: Watch,
    alt: 'Um relógio no pulso mostrando o eilo, com a frase “toque quando a palavra travar”.',
    title: 'No pulso',
    body: 'A dica chega como vibração discreta.'
  },
  {
    file: 'art/phone-lilac',
    icon: Smartphone,
    alt: 'Um celular na mesa com a tela do eilo esperando a palavra.',
    title: 'No celular',
    body: 'Escuta o ambiente e avisa quando precisa.'
  },
  {
    file: 'art/ouvido',
    icon: Headphones,
    alt: 'Uma mulher ajustando o fone de ouvido sem fio.',
    title: 'No ouvido',
    body: 'A sílaba chega em volume discreto.'
  }
]

export function Surfaces() {
  const dir = join(process.cwd(), 'public')

  return (
    <section id="gadgets" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
      <Reveal>
        <span className="inline-block rounded-full bg-[#efe9fb] px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
          No pulso e no ouvido
        </span>
        <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-semibold tracking-[-0.035em] text-balance">
          Use com o seu relógio. A palavra chega antes da tela.
        </h2>
        <p className="mt-5 max-w-[42rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
          Olhar para o celular interrompe a conversa. No pulso, a dica vira compasso: um pulso por
          sílaba, o longo na sílaba forte.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {CARDS.map((card, i) => {
          const src = `/${card.file}.webp`
          const has = existsSync(join(dir, `${card.file}.webp`))

          return (
            <Reveal key={card.title} delay={i * 80} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_44px_-32px_rgba(70,55,120,0.65)]">
                <div className="relative aspect-[9/10] overflow-hidden rounded-[1.5rem]">
                  {has ? (
                    <img
                      src={src}
                      alt={card.alt}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="v3-tile-1 grid size-full place-items-center">
                      <card.icon className="size-10 text-[var(--v3-accent)]" />
                    </div>
                  )}
                </div>

                <div className="px-7 pt-6 pb-7">
                  <h3 className="text-[1.25rem] leading-snug font-semibold tracking-[-0.03em]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
                    {card.body}
                  </p>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
