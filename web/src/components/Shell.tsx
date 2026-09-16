'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BottomBar } from '@/components/BottomBar'
import { useSyncChannel } from '@/hooks/useSyncChannel'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { cn } from '@/lib/utils'

export function Shell({ children }: { children: React.ReactNode }) {
  useSyncChannel()
  const { available: installable, install } = useInstallPrompt()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="grid min-h-dvh place-items-center bg-stage md:p-7">
      <div className="w-full max-w-[440px] md:rounded-frame md:bg-frame md:p-2.5 md:shadow-stage">
        <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-ink md:h-[min(880px,calc(100dvh-76px))] md:rounded-screen">
          <header className="relative z-20 flex items-center px-7 pb-2 pt-[calc(22px+env(safe-area-inset-top,0px))]">
            <span className="flex items-center gap-1.5 text-[19px] font-semibold tracking-[-0.04em] text-fg">
              <i aria-hidden="true" className="brand-mark" />
              eilo
            </span>

            <button
              onClick={() => setMenuOpen(open => !open)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              className="ml-auto flex h-5 w-8 min-h-0 flex-col justify-center gap-1.5"
            >
              <span className="h-[1.5px] rounded-sm bg-fg" />
              <span className="ml-auto h-[1.5px] w-[70%] rounded-sm bg-fg" />
            </button>

            {menuOpen && (
              <div className="glass absolute right-6 top-[calc(100%-4px)] z-30 flex w-44 flex-col gap-1 rounded-panel p-2">
                <Link
                  href="/consent"
                  onClick={() => setMenuOpen(false)}
                  className="grid min-h-tap items-center rounded-card px-3 text-left text-sm text-fg"
                >
                  primeiro acesso
                </Link>
                {installable && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      void install()
                    }}
                    className="rounded-card px-3 text-left text-sm font-semibold text-brand"
                  >
                    instalar
                  </button>
                )}
              </div>
            )}
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>

          <BottomBar />
        </div>
      </div>
    </div>
  )
}
