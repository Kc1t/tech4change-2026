import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { Device, ScreenMap, ScreenMoment, ScreenProgress } from './app-screens'
import { PhoneShell } from './phone'

const NAV = [
  { label: 'O que é', href: '#jornada' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'As telas', href: '#telas' }
]

export function Hero() {
  return (
    <div className="p-3 sm:p-4">
      <section className="v3-hero-surface relative isolate flex min-h-[max(88vh,720px)] flex-col items-center overflow-hidden rounded-[1.75rem] px-6 pb-[clamp(300px,34vw,430px)] text-center sm:rounded-[2rem]">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img src="/sky.webp" alt="" className="size-full object-cover object-center" />
          <div className="v3-hero-veil absolute inset-0" />
        </div>

        <nav
          aria-label="Principal"
          className="v3-nav-surface relative z-30 mt-5 flex w-full max-w-[660px] items-center gap-4 rounded-full p-2 pl-5 text-white"
        >
          <a href="/" className="flex flex-1 shrink-0 items-center">
            <Logo className="h-7" />
          </a>

          <ul className="hidden shrink-0 items-center gap-7 md:flex">
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

        <p className="v3-badge-surface relative z-20 mt-12 inline-flex items-center gap-2.5 rounded-full py-1 pr-4 pl-1 text-[0.78rem] text-[#6f6c7c] sm:mt-14">
          <b className="inline-flex items-center gap-1.5 rounded-full border border-[var(--v3-line)] bg-white px-3 py-1.5 font-medium text-[var(--v3-ink)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Sparkles className="size-3.5 text-[var(--v3-accent)]" />
            IA com guarda-corpo
          </b>
          <span className="hidden sm:inline">O modelo ordena a escada sem nunca ver a palavra</span>
          <span className="sm:hidden">Sem nunca ver a palavra</span>
        </p>

        <h1 className="relative z-20 mt-5 max-w-4xl text-[clamp(2.4rem,5.6vw,4.2rem)] leading-[1.08] font-medium tracking-[-0.038em] text-balance">
          Ele sabe qual é a palavra.
          <br />
          E o eilo alcança ela junto.
        </h1>

        <p className="relative z-20 mt-6 max-w-[34rem] text-[1.02rem] leading-[1.65] text-[var(--v3-muted)] text-balance">
          Depois de um AVC, a palavra some no meio da frase. O eilo escuta a conversa e a IA monta o
          caminho até ela em segundos, sem nunca ver a palavra.
        </p>

        <div className="relative z-20 mt-9">
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
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-[clamp(260px,34vw,400px)] items-end justify-center gap-4"
        >
          <PhoneShell
            cropped
            className="hidden h-[78%] w-[250px] opacity-95 lg:block"
          >
            <Device width={238}>
              <ScreenMap bar={false} />
            </Device>
          </PhoneShell>
          <PhoneShell cropped className="z-10 h-full w-[286px]">
            <Device width={274}>
              <ScreenMoment orb={132} footer={0} bar={false} />
            </Device>
          </PhoneShell>
          <PhoneShell
            cropped
            className="hidden h-[78%] w-[250px] opacity-95 lg:block"
          >
            <Device width={238}>
              <ScreenProgress bar={false} />
            </Device>
          </PhoneShell>
        </div>
      </section>
    </div>
  )
}
