'use client'

import { useEffect, useState } from 'react'
import { buildSeedGraph, readSeed } from '@/domain/seed'
import { installSeed, useApp } from '@/store'

export function SeedGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

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

  if (!ready) return null

  return <>{children}</>
}
