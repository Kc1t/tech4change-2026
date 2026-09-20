import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { Ear, Fingerprint, Link2, Sprout } from 'lucide-react'
import { Device, ScreenMoment } from './app-screens'
import { GraphArt, SeedArt } from './how-art'
import { PhoneShell } from './phone'
import { Reveal } from './reveal'

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#efeafb] text-[var(--v3-accent)]">
      {children}
    </span>
  )
}

function Card({
  icon,
  title,
  body,
  children,
  className = ''
}: {
  icon: React.ReactNode
  title: string
  body: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[1.5rem] bg-white p-7 text-left shadow-[0_18px_44px_-32px_rgba(70,55,120,0.65)] ${className}`}
    >
      <Chip>{icon}</Chip>
      <h3 className="relative z-10 mt-7 max-w-[11.5rem] text-[1.25rem] leading-[1.2] font-semibold tracking-[-0.03em]">
        {title}
      </h3>
      <p className="relative z-10 mt-2.5 max-w-[13rem] text-[0.92rem] leading-relaxed text-[var(--v3-muted)]">
        {body}
      </p>
      {children}
    </article>
  )
}

export function How() {
  const hasPortrait = existsSync(join(process.cwd(), 'public', 'art', 'woman.webp'))
  const hasShield = existsSync(join(process.cwd(), 'public', 'art', 'shield-phone.webp'))

  return (
    <section
      id="como-funciona"
      className="mx-auto max-w-6xl px-6 pb-24 text-center sm:px-10 sm:pb-32"
    >
      <Reveal>
        <span className="inline-block rounded-full bg-[#efe9fb] px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
          Como funciona
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-semibold tracking-[-0.035em] text-balance">
          O nome da sua neta não está
          <br />
          nos pesos de nenhum modelo.
        </h2>
        <p className="mx-auto mt-5 max-w-[38rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
          A IA não adivinha a palavra. Ela ordena degraus sobre um grafo das pessoas e dos lugares
          da sua vida, montado no seu aparelho.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-5 lg:grid-cols-[1fr_318px_1fr] lg:items-stretch">
        <div className="grid gap-5 lg:grid-rows-2">
          <Reveal className="h-full">
            <Card
              icon={<Sprout className="size-[1.15rem]" />}
              title="O mapa começa em zero."
              body="Não existe mapa pronto. Ele se monta com o que já está no aparelho."
            >
              <SeedArt />
            </Card>
          </Reveal>

          <Reveal delay={80} className="h-full">
            <Card
              icon={<Link2 className="size-[1.15rem]" />}
              title="A IA propõe, o grafo confirma."
              body="Todo degrau cita uma aresta real. Se não bate, a resposta cai."
            >
              <GraphArt />
            </Card>
          </Reveal>
        </div>

        <Reveal delay={40} className="h-full">
          <PhoneShell className="mx-auto h-full max-w-full min-h-[600px] w-[318px]">
            <Device width={306}>
              <ScreenMoment state="cue" />
            </Device>
          </PhoneShell>
        </Reveal>

        <div className="grid gap-5 lg:grid-rows-2">
          <Reveal delay={120} className="h-full">
            <Card
              icon={<Ear className="size-[1.15rem]" />}
              title="Ele percebe a pausa sozinho."
              body="A escuta roda no aparelho e reconhece a palavra que não veio."
              className={hasPortrait ? 'pr-[46%]' : ''}
            >
              {hasPortrait ? (
                <span
                  aria-hidden="true"
                  className="v3-art-fade pointer-events-none absolute inset-y-0 right-0 w-[50%] overflow-hidden"
                >
                  <img
                    src="/art/woman.webp"
                    alt=""
                    loading="lazy"
                    className="size-full object-cover object-[46%_34%]"
                  />
                </span>
              ) : null}
            </Card>
          </Reveal>

          <Reveal delay={200} className="h-full">
            <Card
              icon={<Fingerprint className="size-[1.15rem]" />}
              title="A IA nunca vê a palavra."
              body="O modelo recebe identificadores opacos. Nenhum nome, nenhum rótulo."
            >
              {hasShield ? (
                <img
                  src="/art/shield-phone.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="v3-art-soft pointer-events-none absolute -right-[1%] -bottom-[4%] w-[46%]"
                />
              ) : null}
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
