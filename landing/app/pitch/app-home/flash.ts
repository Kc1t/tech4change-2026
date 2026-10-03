import { useEffect, useState } from 'react'
import type { DemoCue } from '../demo/types'

const KIND_LABEL: Record<string, string> = {
  category: 'categoria',
  relation: 'relação',
  place: 'lugar',
  use: 'uso',
  shape: 'forma',
  phonological: 'pista sonora'
}

const FLASH_MS = 5200
const WORD_FLASH_MS = 7000

export type Flash = { text: string; caption: string; isWord: boolean; key: string }

export function flashFor(cue: DemoCue): Flash | null {
  const key = `${cue.phase}-${cue.level}-${cue.text}`
  if (cue.phase === 'cue') {
    const kind = KIND_LABEL[cue.kind ?? ''] ?? KIND_LABEL.category
    return { text: cue.text, caption: `pista ${cue.level + 1} · ${kind}`, isWord: false, key }
  }
  if (cue.phase === 'given') return { text: cue.text, caption: 'aqui está a palavra', isWord: true, key }
  if (cue.phase === 'success') return { text: cue.text, caption: 'foi você que achou', isWord: true, key }
  return null
}

export function useTimedFlash(cue: DemoCue) {
  const current = flashFor(cue)
  const [expired, setExpired] = useState<string | null>(null)
  const key = current?.key ?? null
  const isWord = current?.isWord ?? false

  useEffect(() => {
    setExpired(null)
    if (!key) return
    const timer = window.setTimeout(() => setExpired(key), isWord ? WORD_FLASH_MS : FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [key, isWord])

  return current && current.key !== expired ? current : null
}
