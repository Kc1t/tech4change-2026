import { ArrowRight, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { BuddyMark } from '@/components/fono/ai-assist'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

const POINTS = [
  {
    icon: null,
    title: 'Um assistente que lê a semana',
    body: 'A IA resume os travamentos em uma frase e sugere o que levar para a sessão. Você anota ou dispensa.'
  },
  {
    icon: SlidersHorizontal,
    title: 'Você decide o que a IA faz',
    body: 'Ligar ou desligar a IA nas pistas, tirar a pista de som, mudar quanto tempo ela espera a pausa.'
  },
  {
    icon: ShieldCheck,
    title: 'Dá para ver como ela decidiu',
    body: 'Quantas escadas a IA ordenou e quantas vieram da escada pronta. Ela só vê códigos, nunca nomes.'
  }
]

export function ClinicianPanel() {
  return (
    <section id="painel-fono" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-24 sm:px-10 sm:pb-32">
      <div className="v3-band relative isolate overflow-hidden rounded-[1.75rem] px-6 pt-12 sm:px-12 sm:pt-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-white/80 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
                Painel para a fono
              </span>
              <h2 className="mt-5 max-w-2xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
                A fono no comando. A IA faz o trabalho pesado.
              </h2>
            </div>
            <Button
              asChild
              className="v3-dark-btn h-11 rounded-xl px-5 text-[0.88rem] font-medium text-white"
            >
              <a href="/fono">
                Abrir o painel
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
          <p className="mt-5 max-w-[40rem] text-[1.02rem] leading-[1.7] text-[#5f5c70]">
            A sessão mostra a quarta-feira. O painel mostra o resto da semana, com um assistente de IA
            que organiza tudo e deixa a decisão com você.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 80}>
              {point.icon ? (
                <point.icon className="size-5 text-[var(--v3-accent)]" />
              ) : (
                <BuddyMark size={22} />
              )}
              <h3 className="mt-3 text-[1.02rem] font-medium tracking-[-0.02em]">{point.title}</h3>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[#6b687a]">{point.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="relative mx-auto mt-12 -mb-px max-w-5xl overflow-hidden rounded-t-[1.1rem] border border-b-0 border-white/90 bg-white shadow-[0_30px_80px_-30px_rgba(70,55,120,0.45)]">
            <div className="flex items-center gap-2 border-b border-[var(--v3-line)] bg-[#faf9fd] px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-[#e6e3ef]" />
              <span className="size-2.5 rounded-full bg-[#e6e3ef]" />
              <span className="size-2.5 rounded-full bg-[#e6e3ef]" />
              <span className="mx-auto rounded-md bg-white px-10 py-0.5 text-[0.7rem] text-[var(--v3-muted)] ring-1 ring-[var(--v3-line)]">
                eilo.kc1t.com/fono
              </span>
            </div>
            <img
              src="/art/painel-fono.webp"
              alt="O painel da fono: indicadores da semana, a curva do degrau médio, a tabela palavra por palavra e, à direita, o assistente de IA com o resumo e as sugestões."
              loading="lazy"
              className="block w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
