'use client'

import { useEffect, useState } from 'react'

export type NodeKind = 'person' | 'place' | 'object' | 'event'

export interface KnownWord {
  label: string
  kind: NodeKind
  photo?: string
}

export type NameIndex = Map<string, KnownWord>

// Espelha buildSeedGraph(DEMO_SEED) de mobile/src/domain/seed.ts
const DEMO_PATIENT: Array<[label: string, kind: NodeKind, photo: string]> = [
  ['Helena', 'person', '/fono/helena.webp'],
  ['Letícia', 'person', '/fono/leticia.webp'],
  ['Sorocaba', 'place', '/fono/sorocaba.webp'],
  ['escumadeira', 'object', '/fono/escumadeira.webp'],
  ['almoço de domingo', 'event', '/fono/almoco.webp']
]

export const DEMO_PATIENT_PHOTO = '/fono/helena.webp'

export const PROTECTED_WORD = 'palavra protegida'

export async function nodeId(label: string, kind: NodeKind): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${label}|${kind}`))
  const hex = Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
  return `n_${hex.slice(0, 6)}`
}

async function buildNameIndex(): Promise<NameIndex> {
  if (!globalThis.crypto?.subtle) return new Map()
  const entries = await Promise.all(
    DEMO_PATIENT.map(
      async ([label, kind, photo]) => [await nodeId(label, kind), { label, kind, photo }] as const
    )
  )
  return new Map(entries)
}

export function useNameIndex() {
  const [index, setIndex] = useState<NameIndex>(() => new Map())

  useEffect(() => {
    let alive = true
    buildNameIndex()
      .then(built => {
        if (alive) setIndex(built)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return index
}
