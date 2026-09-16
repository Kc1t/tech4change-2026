'use client'

import { ArrowDown, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScrollOffset } from './use-scroll-progress'

const PRODUCT = 'Eilo'
const REPO = 'https://github.com/Kc1t/tech4change-2026'

const PILLS = ['escuta sem gravar', 'funciona sem internet', 'a palavra não sai do aparelho']

export function Hero() {
  const offset = useScrollOffset()
  const depth = Math.min(offset, 900)

  return (
    <section className="relative isolate h-[100svh] min-h-[620px] w-full overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]">
      <div
        className="absolute inset-0 -z-20 will-change-transform"
        style={{ transform: `translate3d(0, ${depth * 0.22}px, 0) scale(${1 + depth * 0.00018})` }}
      >
        <img
          src="/story/hero-table.webp"
          alt="Almoço de domingo em família. O avô está no meio de uma frase, a mão parada no ar, e todos esperam."
          className="size-full object-cover object-[38%_center] sm:object-center"
          fetchPriority="high"
        />
      </div>
      <div className="scrim absolute inset-0 -z-10" />
      <div className="scrim-side absolute inset-0 -z-10 hidden md:block" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(18,12,10,0.88)] via-[rgba(18,12,10,0.5)] to-transparent md:hidden" />

      <header className="relative z-20 flex items-center gap-4 px-5 pt-6 sm:px-8">
        <span className="flex items-baseline gap-2 text-lg font-semibold tracking-[-0.04em] lowercase text-white">
          <i aria-hidden="true" className="brand-mark translate-y-[-1px]" />
          {PRODUCT}
        </span>

        <nav className="glass-dark ml-auto hidden items-center gap-7 rounded-full px-6 py-2.5 text-[0.82rem] font-medium text-white/85 md:flex">
          <a href="#o-segundo" className="transition-colors hover:text-white">
            o segundo
          </a>
          <a href="#o-mapa" className="transition-colors hover:text-white">
            o mapa
          </a>
          <a href="#privacidade" className="transition-colors hover:text-white">
            privacidade
          </a>
          <a href="#testar" className="transition-colors hover:text-white">
            testar
          </a>
        </nav>

        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="glass-dark ml-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.82rem] font-medium text-white/85 transition-colors hover:text-white md:ml-0"
        >
          <Code2 className="size-4" />
          repositório
        </a>
      </header>

      <div className="relative z-10 flex h-[calc(100%-5.5rem)] flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="max-w-[46rem]">
          <p className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-white/85 uppercase">
            <i aria-hidden="true" className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-brand-warm [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-warm" />
            </i>
            afasia pós-AVC
          </p>

          <h1 className="mt-5 text-[clamp(2.4rem,7.4vw,5.4rem)] leading-[0.95] font-medium tracking-[-0.04em] text-white text-balance sm:mt-6">
            Ele sabe qual é a palavra.
            <span className="display mt-1 block text-[clamp(2.8rem,8vw,5.8rem)] leading-[0.92] italic">
              E não diz.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-white/80 sm:mt-6 sm:text-[1.02rem]">
            Um em cada três sobreviventes de AVC fica com afasia, e o sintoma mais comum dela é não
            achar a palavra. A palavra não sumiu — o caminho até ela sumiu.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <Button asChild size="lg" className="rounded-full">
              <a href="#o-segundo">
                Ver o segundo em que ela falta
                <ArrowDown className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="glass-dark rounded-full text-white hover:bg-white/15 hover:text-white"
            >
              <a href="#testar">Testar com o seu nome</a>
            </Button>
          </div>
        </div>

        <ul className="mt-10 hidden flex-wrap gap-2.5 sm:flex">
          {PILLS.map(pill => (
            <li
              key={pill}
              className="glass-dark rounded-full px-4 py-2 text-[0.78rem] font-medium text-white/85"
            >
              {pill}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-dark absolute right-5 bottom-14 z-10 hidden w-[19rem] rounded-2xl p-5 lg:block">
        <p className="flex items-center justify-between text-[0.66rem] font-semibold tracking-[0.14em] text-white/60 uppercase">
          domingo, 11h04
          <span className="flex items-center gap-1.5 text-white/80">
            <i className="block size-1.5 animate-pulse rounded-full bg-brand-warm" />
            escutando
          </span>
        </p>
        <p className="mt-3 text-[1.02rem] leading-snug text-white/90">
          — Mãe, quem que vem no domingo?
        </p>
        <p className="mt-2 text-[1.02rem] leading-snug text-white/55 italic">
          — É a minha… a minha…
        </p>
      </div>
    </section>
  )
}
