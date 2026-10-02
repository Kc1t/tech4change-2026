'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { SubjectRow } from './api'

const STORAGE_KEY = 'eilo.fono.pacientes'

interface Roster {
  names: Record<string, string>
  order: string[]
}

const listeners = new Set<() => void>()
let memoryCopy: string | null = null

function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryCopy
  } catch {
    return memoryCopy
  }
}

function parse(raw: string | null): Roster {
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<Roster>) : {}
    return {
      names: parsed.names && typeof parsed.names === 'object' ? parsed.names : {},
      order: Array.isArray(parsed.order) ? parsed.order : []
    }
  } catch {
    return { names: {}, order: [] }
  }
}

function write(roster: Roster) {
  memoryCopy = JSON.stringify(roster)
  try {
    window.localStorage.setItem(STORAGE_KEY, memoryCopy)
  } catch {}
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function usePatientNames(subjects: SubjectRow[] | undefined, demoSubject: string | null) {
  const raw = useSyncExternalStore(subscribe, read, () => null)
  const roster = useMemo(() => parse(raw), [raw])

  useEffect(() => {
    if (!subjects) return
    const current = parse(read())
    const unseen = [...subjects]
      .reverse()
      .map(row => row.subject)
      .filter(subject => !current.order.includes(subject))
    const namedHelena = Object.values(current.names).includes('Helena')
    const claimHelena = demoSubject != null && !current.names[demoSubject] && !namedHelena
    if (unseen.length === 0 && !claimHelena) return
    write({
      order: [...current.order, ...unseen],
      names: claimHelena ? { ...current.names, [demoSubject]: 'Helena' } : current.names
    })
  }, [subjects, demoSubject])

  const nameOf = useCallback(
    (subject: string) => {
      const custom = roster.names[subject]
      if (custom) return custom
      const position = roster.order.indexOf(subject)
      return position >= 0 ? `Paciente ${position + 1}` : 'Paciente'
    },
    [roster]
  )

  const rename = useCallback((subject: string, name: string) => {
    const clean = name.trim().slice(0, 40)
    const current = parse(read())
    const names = { ...current.names }
    if (clean) names[subject] = clean
    else delete names[subject]
    write({ ...current, names })
  }, [])

  return { nameOf, rename }
}

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const AVATAR_TONES = [
  'bg-[#e2d6f3] text-[#5b3f8c]',
  'bg-[#d3e8d8] text-[#2f6b47]',
  'bg-[#f7e0c6] text-[#7a4a1c]',
  'bg-[#f9d9cf] text-[#8a3b2a]',
  'bg-[#d8ecfb] text-[#2b5a7a]'
]

export function avatarTone(subject: string) {
  let hash = 0
  for (const char of subject) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}
