import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

function device(file: string) {
  return existsSync(join(process.cwd(), 'public', 'devices', file))
}

export function Hero() {
  const hasWatch = device('watch.webp')
  const hasAirpods = device('airpods.webp')

  return (
    <section className="v2 relative isolate flex min-h-dvh flex-col overflow-hidden">
      <img
        src="/sky.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/72 via-white/34 to-white" />

      <header className="relative z-30 flex items-center gap-6 px-6 py-5 sm:px-10">
        <a
          href="/v2"
          className="flex items-baseline gap-2 text-[1.4rem] font-bold tracking-[-0.045em] lowercase"
        >
          <i aria-hidden="true" className="brand-mark translate-y-[-1px]" />
          eilo
        </a>

        <NavigationMenu className="mx-auto hidden md:flex">
          <NavigationMenuList className="gap-2">
            {NAV.map(item => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  href={item.href}
                  className="rounded-full bg-transparent px-4 py-2 text-[0.92rem] font-medium text-[var(--v2-dim)] transition-colors hover:bg-white/60 hover:text-[var(--v2-ink)] focus:bg-white/60"
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button
          asChild
          size="lg"
          className="ml-auto rounded-full bg-[#191721] px-6 text-white shadow-[0_12px_28px_-14px_rgba(25,23,33,0.9)] hover:bg-[#2b2734] md:ml-0"
        >
          <a href="#baixar">
            Baixar o app
            <ArrowRight className="size-4" />
          </a>
        </Button>
      </header>

      <div className="relative z-20 mx-auto mt-2 max-w-3xl px-6 text-center">
        <Badge
          variant="secondary"
          className="v2-pill gap-2 rounded-full border-0 px-4 py-1.5 text-[0.66rem] font-semibold tracking-[0.16em] text-[var(--v2-dim)] uppercase"
        >
          <i aria-hidden="true" className="block size-1.5 rounded-full bg-[var(--v2-purple)]" />
          mais presença no seu dia
        </Badge>

        <h1 className="mt-6 text-[clamp(2.1rem,4.9vw,3.6rem)] leading-[1.06] font-medium tracking-[-0.045em] text-balance">
          Ele sabe qual
          <br />é a palavra.
          <br />
          <span className="v2-gradient-text">E não diz.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-[1.02rem] leading-relaxed text-[var(--v2-dim)] text-balance">
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

      <div className="relative z-10 mt-6 min-h-[clamp(280px,30vw,400px)] flex-1">
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

        <div className="mx-auto flex max-w-6xl items-center justify-center px-6">
          {hasWatch && (
            <div className="absolute top-[6%] -left-[4%] w-[clamp(112px,16vw,238px)] sm:left-[4%] lg:left-[10%] [animation:v2-float_7s_ease-in-out_infinite] ">
              <img
                src="/devices/watch.webp"
                alt="Um relógio com a dica acendendo na tela."
                className="v2-device-glow w-full"
              />
              <span className="v2-pill absolute -top-4 right-0 hidden items-center gap-2 md:flex rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium whitespace-nowrap">
                <i className="block size-1.5 rounded-full bg-[var(--v2-purple)]" />
                No seu ritmo
              </span>
            </div>
          )}

          <PhoneListening />

          {hasAirpods && (
            <div className="absolute top-[14%] -right-[5%] w-[clamp(100px,13.5vw,196px)] sm:right-[4%] lg:right-[10%] [animation:v2-float_8.5s_ease-in-out_infinite_0.8s] ">
              <img
                src="/devices/airpods.webp"
                alt="Fones sem fio, por onde a dica também chega."
                className="v2-device-glow w-full"
              />
              <span className="v2-pill absolute -bottom-4 left-0 hidden items-center gap-2 md:flex rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium whitespace-nowrap">
                <i className="block size-1.5 rounded-full bg-[var(--v2-pink)]" />
                Em qualquer lugar
              </span>
            </div>
          )}
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
