import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Device, ScreenMap, ScreenMoment, ScreenProgress } from './app-screens'
import { PhoneShell } from './phone'
import { Reveal } from './reveal'

const SCREENS = [
  {
    tag: 'A que importa',
    tile: 'v3-tile-1',
    title: 'O Momento',
    body: 'A única tela que se usa com a palavra travada. Quatro degraus, um toque, e a conversa continua.',
    screen: <ScreenMoment state="word" orb={150} footer={12} bar={false} />
  },
  {
    tag: 'Nos bastidores',
    tile: 'v3-tile-2',
    title: 'O Mapa',
    body: 'O grafo que se monta das fotos do próprio aparelho. A família confirma uma vez e ninguém preenche formulário toda semana.',
    screen: <ScreenMap bar={false} />
  },
  {
    tag: 'Uma vez por semana',
    tile: 'v3-tile-3',
    title: 'O Progresso',
    body: 'O degrau médio caindo semana a semana. Cada ponto é uma palavra alcançada neste aparelho — nada aqui é estimativa.',
    screen: <ScreenProgress bar={false} />
  }
]

const STATS = [
  { value: '17%', label: 'das palavras falhadas saem com pista fonológica' },
  { value: '168h', label: 'tem a semana de quem vive com afasia' },
  { value: '1h', label: 'dela tem a fonoaudióloga por perto' }
]

export function Screens() {
  return (
    <section id="telas" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="max-w-2xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
            Três telas. E a que importa você quase não usa.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
            O eilo foi feito para desaparecer. O sucesso dele é a conversa seguir sem ninguém
            reparar que houve ajuda.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-xl border-[var(--v3-line)] bg-white px-5 text-[0.88rem] text-[var(--v3-ink)] hover:bg-[#f7f6fb]"
        >
          <a href="/experimentar">
            Ver na prática
            <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {SCREENS.map((screen, i) => (
          <Reveal key={screen.title} delay={i * 80} className="h-full">
          <article
            className={`${screen.tile} relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[1.5rem] p-7`}
          >
            <span className="self-start rounded-full bg-white/70 px-3 py-1.5 text-[0.66rem] font-semibold tracking-[0.12em] text-[#4b4462] uppercase">
              {screen.tag}
            </span>
            <h3 className="mt-6 text-[1.25rem] leading-snug font-medium tracking-[-0.025em]">
              {screen.title}
            </h3>
            <p className="mt-2.5 text-[0.9rem] leading-relaxed text-[#6b687a]">{screen.body}</p>
            <div aria-hidden="true" className="relative mt-auto h-[256px]">
              <PhoneShell
                cropped
                className="absolute bottom-[-32px] left-1/2 h-[calc(100%+32px)] w-[186px] -translate-x-1/2"
              >
                <Device width={174}>{screen.screen}</Device>
              </PhoneShell>
            </div>
          </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20">
      <div className="v3-band relative isolate grid overflow-hidden rounded-[1.75rem] lg:grid-cols-[1fr_0.85fr]">

        <div className="m-5 rounded-[1.35rem] bg-white p-9 sm:m-7 sm:p-11">
          <span className="inline-block rounded-full bg-[#efe9fb] px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
            De onde vem
          </span>
          <h3 className="mt-5 text-[clamp(1.5rem,2.6vw,2.05rem)] leading-[1.18] font-medium tracking-[-0.03em] text-balance">
            A pista fonológica é a alavanca mais barata que a literatura conhece.
          </h3>
          <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.7] text-[var(--v3-muted)]">
            O eilo não inventa um método novo. Ele pega uma técnica que o fonoaudiólogo já usa na
            sessão e a coloca no único lugar onde ela ainda não estava: nos outros 167 dias da
            semana.
          </p>

          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {STATS.map(stat => (
              <div key={stat.value}>
                <dt className="tabular text-[2.1rem] leading-none font-medium text-[var(--v3-accent)]">
                  {stat.value}
                </dt>
                <dd className="mt-2.5 text-[0.82rem] leading-snug text-[var(--v3-muted)]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden overflow-hidden lg:block" aria-hidden="true">
          <div className="v3-photo-fade absolute inset-y-0 -left-[16%] right-0">
            <img
              src="/story/scene-granddaughter.webp"
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover object-[46%_32%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(38,26,66,0.1),rgba(38,26,66,0.44))]" />
          </div>
          <div className="absolute inset-0 grid place-items-center px-8">
            <p className="max-w-[15rem] text-center text-[1.35rem] leading-[1.3] font-medium tracking-[-0.025em] text-white text-balance">
              “Letícia.” Levou dois degraus e quatro segundos.
            </p>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  )
}
