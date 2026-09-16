import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ChevronRight, Ear, Fingerprint, Link2, Pause, Sprout } from 'lucide-react'
import { GraphArt, SeedArt } from './how-art'
import { PhoneShell } from './phone'
import { Reveal } from './reveal'

const RUNGS = [
  { level: 'degrau 1', text: 'Alguém da sua família' },
  { level: 'degrau 2', text: 'Um lugar que você conhece' },
  { level: 'degrau 3', text: 'Alguém mais novo que você' }
]

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

function Screen() {
  return (
    <div className="flex h-full flex-col bg-white px-5 pt-12 pb-6">
      <p className="flex items-center gap-1.5 text-[0.78rem] text-[var(--v3-muted)]">
        <ChevronRight className="size-3.5 rotate-180" />A palavra travou
      </p>

      <div className="mt-4 space-y-2.5">
        {RUNGS.map(rung => (
          <div
            key={rung.level}
            className="flex items-center gap-3 rounded-2xl bg-[#f6f4fc] px-3 py-2.5"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#e2dbf7] text-[var(--v3-accent)]">
              <Sprout className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.58rem] font-semibold tracking-[0.12em] text-[var(--v3-accent)] uppercase">
                {rung.level}
              </span>
              <span className="block truncate text-[0.78rem] leading-snug">{rung.text}</span>
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-[#b6b0c6]" />
          </div>
        ))}

        <div className="flex items-center gap-3 rounded-2xl bg-[linear-gradient(140deg,#7a6bb4,#4a4166)] px-3 py-3 text-white">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/20">
            <Sprout className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.58rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
              degrau 4
            </span>
            <span className="block text-[1.05rem] leading-snug font-semibold">Letícia</span>
          </span>
          <ChevronRight className="size-3.5 shrink-0 text-white/70" />
        </div>
      </div>

      <div className="my-auto">
      <div aria-hidden="true" className="flex h-9 items-center justify-center gap-[3px]">
        {[6, 13, 9, 20, 26, 16, 30, 22, 34, 18, 28, 12, 20, 8, 14, 6].map((h, i) => (
          <i
            key={i}
            className="w-[3px] rounded-full bg-[var(--v3-accent)]/70"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[0.72rem] text-[var(--v3-muted)]">A conversa continua…</p>
      </div>

      <div className="flex items-center gap-3 rounded-full bg-[#f6f4fc] p-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--v3-accent)] text-white">
          <Pause className="size-3.5 fill-current" />
        </span>
        <span className="tabular flex-1 text-center text-[0.74rem] text-[var(--v3-muted)]">
          0:38 / 2:14
        </span>
        <span className="mr-1 flex items-end gap-[2px]" aria-hidden="true">
          {[6, 11, 8, 12, 7].map((h, i) => (
            <i
              key={i}
              className="w-[2px] rounded-full bg-[var(--v3-accent)]/70"
              style={{ height: `${h}px` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

export function How() {
  const hasPortrait = existsSync(join(process.cwd(), 'public', 'art', 'listening.webp'))
  const hasShield = existsSync(join(process.cwd(), 'public', 'art', 'shield.webp'))

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
            <div className="h-full">
              <Screen />
            </div>
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
                  className="pointer-events-none absolute inset-y-0 right-0 w-[48%] overflow-hidden"
                >
                  <img
                    src="/art/listening.webp"
                    alt=""
                    loading="lazy"
                    className="size-full object-cover object-[40%_30%]"
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
                  src="/art/shield.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute -right-[6%] -bottom-[8%] w-[52%]"
                />
              ) : null}
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
