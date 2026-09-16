'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/store'

const LEFT = [
  { href: '/', label: 'Momento', path: 'M4 11.5 12 5l8 6.5M6.5 10.5V19h11v-8.5' },
  {
    href: '/graph',
    label: 'Grafo',
    path: 'M9 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM19.8 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM3 19c0-2.4 1.9-3.8 4.2-3.8S11.4 16.6 11.4 19M13 19c0-2.4 1.9-3.8 4.2-3.8S21.4 16.6 21.4 19'
  }
]

const RIGHT = [
  { href: '/clinical', label: 'Clínico', path: 'M5 19V9M10 19V5M15 19v-7M20 19v-4' },
  {
    href: '/body',
    label: 'Ajustes',
    path: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'
  }
]

export function BottomBar() {
  const pathname = usePathname()
  const router = useRouter()
  const requestCue = useApp(s => s.requestCue)
  const open = useApp(s => s.open)

  function handleCue() {
    if (pathname !== '/') {
      router.push('/')
      requestCue()
      return
    }
    requestCue()
  }

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
      <div className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5">
        {LEFT.map(tab => (
          <Tab key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}

        <button
          onClick={handleCue}
          aria-label={open ? 'Travou — pedir o próximo degrau' : 'Pedir uma dica agora'}
          className="relative mx-1 grid h-[52px] w-[52px] min-h-0 place-items-center rounded-full"
        >
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--aurora-4),var(--aurora-1)_45%,var(--aurora-2)_78%,var(--aurora-3))] shadow-[0_0_18px_rgba(216,87,124,0.45)]" />
          <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.55),transparent_60%)]" />
        </button>

        {RIGHT.map(tab => (
          <Tab key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}
      </div>
    </nav>
  )
}

function Tab({
  tab,
  active
}: {
  tab: { href: string; label: string; path: string }
  active: boolean
}) {
  return (
    <Link
      href={tab.href}
      aria-label={tab.label}
      aria-current={active ? 'page' : undefined}
      className={[
        'grid h-11 w-11 place-items-center rounded-full transition-colors',
        active ? 'bg-surface text-fg shadow-soft' : 'text-faint'
      ].join(' ')}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[19px] w-[19px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={tab.path} />
      </svg>
    </Link>
  )
}
