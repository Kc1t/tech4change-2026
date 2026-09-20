'use client'

import { BottomBar } from '@/components/BottomBar'
import { Frame } from '@/components/Frame'
import { useSyncChannel } from '@/hooks/useSyncChannel'

export function Shell({ children }: { children: React.ReactNode }) {
  useSyncChannel()

  return (
    <Frame>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      <BottomBar />
    </Frame>
  )
}
