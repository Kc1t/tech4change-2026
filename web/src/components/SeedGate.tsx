'use client'

import { useCallback, useEffect, useState } from 'react'
import { buildSeedGraph, readSeed, saveSeed, type Seed } from '@/domain/seed'
import { Frame } from '@/components/Frame'
import { OnboardingScreen } from '@/screens/OnboardingScreen'
import { installSeed, useApp } from '@/store'

export function SeedGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [needsSeed, setNeedsSeed] = useState(false)

  useEffect(() => {
    let alive = true

    async function boot() {
      const seed = readSeed()
      if (seed) {
        try {
          const { graph, scenes } = await buildSeedGraph(seed)
          installSeed(graph, scenes)
        } catch {
          void 0
        }
      } else if (alive) {
        setNeedsSeed(true)
      }
      await useApp.persist.rehydrate()
      if (alive) setReady(true)
    }

    void boot()

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js')
    }

    return () => {
      alive = false
    }
  }, [])

  const accept = useCallback(async (seed: Seed) => {
    saveSeed(seed)
    const { graph, scenes } = await buildSeedGraph(seed)
    installSeed(graph, scenes)
    setNeedsSeed(false)
  }, [])

  if (!ready) return null

  if (needsSeed)
    return (
      <Frame>
        <OnboardingScreen
          onDone={seed => void accept(seed)}
          onExample={() => setNeedsSeed(false)}
        />
      </Frame>
    )

  return <>{children}</>
}
