import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhoneFrame } from '@/components/demo/phone-frame'
import { GraphStill, MomentStill, PanelStill } from '@/components/demo/screen-stills'
import { Reveal } from './reveal'

const SCREENS = [
  {
    key: 'momento',
    title: 'O Momento',
    body: 'A única tela que se usa com a palavra travada.',
    screen: <MomentStill />
  },
  {
    key: 'mapa',
    title: 'O Mapa',
    body: 'O grafo que se monta das fotos do próprio aparelho.',
    screen: <GraphStill />
  },
  {
    key: 'painel',
    title: 'O Painel',
    body: 'O que o fonoaudiólogo vê na quarta-feira.',
    screen: <PanelStill />
  }
]

const DASHBOARD = [
  { label: 'bloqueios fora da sessão', value: '86' },
  { label: 'degrau médio, esta semana', value: '2,4' },
  { label: 'há um mês', value: '3,6' }
]

export function Product() {
  const hasVideo = existsSync(join(process.cwd(), 'public', 'demo.mp4'))

  return (
    <section id="o-produto" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <p className="label-caps">o que é o eilo</p>
        <h2 className="mt-5 max-w-3xl text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.06] font-medium tracking-[-0.035em] text-balance">
          Três telas. E a que importa
          <span className="display italic"> você quase não usa.</span>
        </h2>
        <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-dim">
          Não é um app de exercícios para fazer todo dia às oito da manhã. É uma ferramenta para um
          segundo — o segundo em que a palavra trava no meio de uma conversa de verdade.
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-12">
        {hasVideo ? (
          <div className="overflow-hidden rounded-[2rem] border border-line bg-stage">
            <video
              controls
              preload="metadata"
              playsInline
              poster="/story/scene-phone.webp"
              className="aspect-video w-full"
            >
              <source src="/demo.mp4" type="video/mp4" />
              O seu navegador não reproduz vídeo. A demonstração interativa faz o mesmo percurso.
            </video>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="/story/scene-phone.webp"
              alt="Um celular deitado na mesa de almoço, escutando."
              className="aspect-video w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[rgba(18,12,10,0.58)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <span className="glass-dark flex size-16 items-center justify-center rounded-full">
                <Play className="size-6 fill-white text-white" />
              </span>
              <p className="mt-5 max-w-xs text-[1.05rem] leading-snug text-white">
                Em vez de assistir, experimente.
              </p>
              <Button asChild size="lg" className="mt-5 rounded-full">
                <a href="/experimentar">
                  Experimentar agora
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </Reveal>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {SCREENS.map((item, i) => (
          <Reveal key={item.key} delay={i * 110}>
            <figure className="flex h-full flex-col">
              <PhoneFrame>{item.screen}</PhoneFrame>
              <figcaption className="mt-6 text-center">
                <h3 className="text-[1.15rem] leading-snug font-medium tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mx-auto mt-1.5 max-w-[16rem] text-[0.9rem] leading-relaxed text-dim">
                  {item.body}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-16">
        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src="/story/scene-therapist.webp"
            alt="Uma fonoaudióloga no consultório, olhando o painel da semana."
            loading="lazy"
            className="h-[360px] w-full object-cover object-[28%_center] sm:h-[420px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,14,12,0.9)] via-[rgba(20,14,12,0.3)] to-transparent lg:bg-gradient-to-l lg:from-[rgba(20,14,12,0.92)] lg:via-[rgba(20,14,12,0.45)]" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:inset-y-0 lg:left-auto lg:flex lg:w-[48%] lg:flex-col lg:justify-center">
            <p className="label-caps text-white/55">para o fonoaudiólogo</p>
            <p className="mt-3 max-w-md text-[clamp(1.3rem,2.4vw,1.9rem)] leading-snug font-medium tracking-[-0.03em] text-white text-balance">
              A sessão mostra a quarta-feira. O painel mostra o domingo.
            </p>

            <dl className="glass-dark mt-5 max-w-sm rounded-2xl p-4">
              {DASHBOARD.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-4 py-2 ${
                    i > 0 ? 'border-t border-white/12' : ''
                  }`}
                >
                  <dt className="text-[0.8rem] text-white/60">{row.label}</dt>
                  <dd className="display tabular text-[1.4rem] leading-none text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
