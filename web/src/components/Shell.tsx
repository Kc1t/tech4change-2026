'use client'

import { BottomBar } from '@/components/BottomBar'
import { useSyncChannel } from '@/hooks/useSyncChannel'

export function Shell({ children }: { children: React.ReactNode }) {
  useSyncChannel()

  return (
    <div className="grid min-h-dvh place-items-center bg-stage md:p-7">
      <div className="w-full max-w-[440px] md:rounded-frame md:bg-frame md:p-2.5 md:shadow-stage">
        <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-ink md:h-[min(880px,calc(100dvh-76px))] md:rounded-screen">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>

          <BottomBar />
        </div>
      </div>
    </div>
  )
}
