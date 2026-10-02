import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { HeroBackdrop } from './hero-backdrop'

const NAV = [
  { label: 'Na prática', href: '#na-pratica' },
  { label: 'Por dentro', href: '#como-funciona' },
  { label: 'Para o fono', href: '/fono' },
  { label: 'Dúvidas', href: '#duvidas' }
]

export function Hero() {
  return (
    <div className="p-3 sm:p-4">
      <section className="group/hero v3-hero-surface relative isolate flex min-h-[max(calc(100svh-2rem),860px)] flex-col items-center overflow-hidden rounded-[1.75rem] px-6 pb-[clamp(260px,30vh,320px)] text-center sm:rounded-[2rem]">
        <HeroBackdrop />

        <nav
          aria-label="Principal"
          className="v3-nav-surface relative z-30 mt-5 flex w-full max-w-[660px] items-center gap-4 rounded-full p-2 pl-5 text-white"
        >
          <a href="/" className="flex flex-1 shrink-0 items-center">
            <Logo className="h-7" />
          </a>

          <ul className="hidden shrink-0 items-center gap-6 md:flex">
            {NAV.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.84rem] text-[#c9c7d3] transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-1 justify-end">
            <a
              href="/experimentar"
              className="shrink-0 rounded-full bg-white px-4 py-1.5 text-[0.8rem] font-medium text-[var(--v3-ink)] transition-transform hover:scale-[1.04]"
            >
              Experimentar
            </a>
          </div>
        </nav>

        <div className="flex w-full max-w-6xl flex-1 flex-col items-center justify-center pt-10 sm:group-data-[align=left]/hero:items-start sm:group-data-[align=left]/hero:px-6 sm:group-data-[align=left]/hero:text-left">
        <p className="v3-badge-surface relative z-20 inline-flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 text-[0.78rem] text-[#6f6c7c] sm:pr-4">
          <b className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap border border-[var(--v3-line)] bg-white px-3 py-1.5 font-medium text-[var(--v3-ink)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Sparkles className="size-3.5 text-[var(--v3-accent)]" />
            Para quem vive com afasia
          </b>
          <span className="hidden sm:inline">Uma pista por vez, no seu tempo</span>
        </p>

        <h1 className="relative z-20 mt-5 max-w-4xl sm:group-data-[align=left]/hero:max-w-[34rem] text-[clamp(2.4rem,5.6vw,4.2rem)] sm:group-data-[align=left]/hero:text-[clamp(2.2rem,4.4vw,3.5rem)] leading-[1.08] font-medium tracking-[-0.038em] text-balance">
          Você sabe qual é a palavra.
          <br />
          O eilo te ajuda a chegar nela.
        </h1>

        <p className="relative z-20 mt-6 max-w-[40rem] text-[1.08rem] leading-[1.75] text-[#57536a] sm:group-data-[align=left]/hero:max-w-[30rem]">
          Depois de um AVC, a palavra some no meio da frase. O eilo escuta junto, percebe a pausa e
          dá uma pista de cada vez, da mais distante à mais próxima, até ela sair.
        </p>

        <div className="relative z-20 mt-9 flex flex-wrap justify-center gap-3 sm:group-data-[align=left]/hero:justify-start">
          <Button
            asChild
            size="lg"
            className="v3-dark-btn h-12 rounded-xl px-7 text-[0.95rem] font-medium text-white"
          >
            <a href="/experimentar">
              Experimentar agora
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-xl border-white/80 bg-white/60 px-6 text-[0.95rem] font-medium text-[var(--v3-ink)] backdrop-blur-md hover:bg-white/85"
          >
            <a href="#na-pratica">Ver como funciona</a>
          </Button>
        </div>
        </div>
      </section>
    </div>
  )
}
