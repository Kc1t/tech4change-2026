'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/store'

const LEFT = [
  {
    href: '/graph',
    label: 'Grafo',
    path: 'M9 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM19.8 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM3 19c0-2.4 1.9-3.8 4.2-3.8S11.4 16.6 11.4 19M13 19c0-2.4 1.9-3.8 4.2-3.8S21.4 16.6 21.4 19'
  },
  {
    href: '/memories',
    label: 'Memórias',
    path: 'M7 4.6h10a1.6 1.6 0 0 1 1.6 1.6v13.2L12 16.4l-6.6 3V6.2A1.6 1.6 0 0 1 7 4.6Z'
  }
]

const RIGHT = [
  { href: '/progress', label: 'Progresso', path: 'M5 19V9M10 19V5M15 19v-7M20 19v-4' },
  {
    href: '/body',
    label: 'Aparelhos',
    path: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'
  }
]

export function BottomBar() {
  const pathname = usePathname()
  const router = useRouter()
  const requestCue = useApp(s => s.requestCue)
  const open = useApp(s => s.open)

  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState<{ left: number; top: number; width: number } | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    function place() {
      const active = tabRefs.current[pathname]
      if (!active) {
        setPill(null)
        return
      }
      setPill({ left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth })
    }

    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [pathname])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const atHome = pathname === '/'

  function handleHome() {
    if (!atHome) {
      router.push('/')
      return
    }
    requestCue()
  }

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-7 pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
      <div className="pointer-events-auto relative flex w-full items-center rounded-full bg-surface px-2 py-2 shadow-[0_2px_6px_rgba(90,70,160,0.06),0_14px_34px_rgba(90,70,160,0.14)]">
        {pill && (
          <span
            aria-hidden="true"
            style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.width }}
            className={[
              'absolute rounded-full bg-fg',
              ready
                ? 'transition-[left,width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                : ''
            ].join(' ')}
          />
        )}

        {LEFT.map(tab => (
          <Tab key={tab.href} tab={tab} active={pathname === tab.href} refs={tabRefs} />
        ))}

        <div className="grid flex-1 place-items-center">
          <span className="rounded-full shadow-[0_6px_20px_rgba(142,127,240,0.4)]">
          <button
            onClick={handleHome}
            aria-current={atHome ? 'page' : undefined}
            aria-label={
              atHome
                ? open
                  ? 'Travou — pedir o próximo degrau'
                  : 'Pedir uma dica agora'
                : 'Ir para o Momento'
            }
            className="relative z-10 grid h-[52px] w-[52px] min-h-0 place-items-center overflow-hidden rounded-full transition-transform active:scale-95"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--aurora-4)_0%,var(--aurora-1)_30%,var(--aurora-2)_60%,var(--aurora-3)_100%)] bg-[length:230%_230%] [animation:orb-glow_14s_ease-in-out_infinite]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_33%_26%,rgba(255,255,255,0.68),transparent_36%)]"
            />
          </button>
          </span>
        </div>

        {RIGHT.map(tab => (
          <Tab key={tab.href} tab={tab} active={pathname === tab.href} refs={tabRefs} />
        ))}
      </div>
    </nav>
  )
}

function Tab({
  tab,
  active,
  refs
}: {
  tab: { href: string; label: string; path: string }
  active: boolean
  refs: React.RefObject<Record<string, HTMLAnchorElement | null>>
}) {
  return (
    <div className="grid flex-1 place-items-center">
      <Link
        href={tab.href}
        ref={node => {
          refs.current[tab.href] = node
        }}
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        className={[
          'relative z-10 grid h-11 w-11 place-items-center rounded-full transition-colors duration-300',
          active ? 'text-ink' : 'text-dim'
        ].join(' ')}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={[
            'h-5 w-5 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            active ? 'scale-110' : 'scale-100'
          ].join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={tab.path} />
        </svg>
      </Link>
    </div>
  )
}
