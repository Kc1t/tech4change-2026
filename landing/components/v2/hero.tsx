import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { PhoneListening } from './phone-listening'

const NAV = [
  { label: 'sobre', href: '#sobre' },
  { label: 'como funciona', href: '#como-funciona' },
  { label: 'privacidade', href: '#privacidade' },
  { label: 'blog', href: '#blog' }
]

export function Hero() {
  return (
    <section className="v2 relative isolate flex min-h-dvh flex-col overflow-hidden">
      <img
        src="/sky.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/72 via-white/34 to-white" />

      <header className="sticky top-4 z-50 px-4">
        <div className="v2-nav mx-auto flex max-w-4xl items-center gap-1 rounded-full py-2 pr-2 pl-5">
          <a
            href="/v2"
            className="mr-3 flex shrink-0 items-baseline gap-1.5 text-[1.15rem] font-bold tracking-[-0.045em] lowercase"
          >
            <i aria-hidden="true" className="brand-mark translate-y-[-1px]" />
            eilo
          </a>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-0.5">
              {NAV.map(item => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className="rounded-full bg-transparent px-3.5 py-2 text-[0.88rem] font-medium whitespace-nowrap text-[var(--v2-dim)] transition-colors hover:bg-[var(--v2-ink)]/6 hover:text-[var(--v2-ink)] focus:bg-[var(--v2-ink)]/6"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            asChild
            className="ml-auto h-10 rounded-full bg-[#191721] px-5 text-[0.88rem] text-white shadow-[0_10px_24px_-14px_rgba(25,23,33,0.9)] hover:bg-[#2b2734]"
          >
            <a href="#baixar">
              Baixar o app
              <ArrowRight className="size-3.5" />
            </a>
          </Button>
        </div>
      </header>

      <div className="relative z-20 mx-auto mt-12 max-w-3xl px-6 text-center">
        <h1 className="text-[clamp(2.3rem,5.4vw,4.1rem)] leading-[1.03] font-extrabold tracking-[-0.055em] text-balance">
          Ele sabe qual é a palavra.
          <br />E não diz.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[0.96rem] leading-relaxed font-normal text-[var(--v2-dim)] text-balance">
          O eilo acompanha, entende e ajuda a pessoa com afasia no dia a dia — pela fala, no
          celular, no relógio ou nos fones.
        </p>

        <div className="mt-7 flex flex-col items-center gap-2.5">
          <Button
            asChild
            size="lg"
            className="h-13 rounded-full bg-[#191721] px-8 text-[1rem] text-white shadow-[0_18px_38px_-18px_rgba(25,23,33,0.95)] hover:bg-[#2b2734]"
          >
            <a href="#baixar">
              Baixar o app
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <p className="text-[0.82rem] text-[var(--v2-faint)]">Disponível para iOS e Android</p>
        </div>
      </div>

      <div className="relative z-10 mt-8 min-h-[clamp(300px,32vw,440px)] flex-1">
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-[26%] -z-10 h-[240px] w-full opacity-75 blur-[1px]"
        >
          <defs>
            <linearGradient id="v2-thread" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ec86b6" stopOpacity="0" />
              <stop offset="24%" stopColor="#ec86b6" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#c8a7e4" stopOpacity="0.9" />
              <stop offset="76%" stopColor="#9b87d9" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#9b87d9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 150 C 140 60, 260 240, 400 150 S 660 60, 800 150 S 1060 240, 1200 150"
            fill="none"
            stroke="url(#v2-thread)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="mx-auto flex max-w-6xl items-start justify-center px-6">
          <PhoneListening />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[20%] bg-gradient-to-t from-white via-white/70 to-transparent"
        />
      </div>

      <p className="relative z-30 pt-4 pb-8 text-center text-[0.7rem] font-medium tracking-[0.24em] text-[var(--v2-faint)] uppercase">
        Tecnologia a serviço da conexão humana
      </p>
    </section>
  )
}
