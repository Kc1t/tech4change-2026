import { cueable, firstSyllable, syllables } from './phonology'
import type { GraphEdge, GraphNode, LifeGraph, NodeKind, Provenance, Scene } from './types'

const STORAGE_KEY = 'seed-answers'
const MAX_ANSWER = 40

export interface Seed {
  owner: string
  person: string
  place: string
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_ANSWER) : ''
}

export function decodeSeed(raw: string): Seed | null {
  try {
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
    const seed = {
      owner: clean(parsed.owner),
      person: clean(parsed.person),
      place: clean(parsed.place)
    }
    return seed.owner && seed.person && seed.place ? seed : null
  } catch {
    return null
  }
}

export function readSeed(): Seed | null {
  const query = window.location.hash.split('?')[1]
  const encoded = query ? new URLSearchParams(query).get('seed') : null

  if (encoded) {
    const seed = decodeSeed(encoded)
    if (seed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      } catch {
        void 0
      }
      const route = window.location.hash.split('?')[0] || '#/moment'
      history.replaceState(null, '', window.location.pathname + window.location.search + route)
      return seed
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Record<string, unknown>
    const seed = {
      owner: clean(parsed.owner),
      person: clean(parsed.person),
      place: clean(parsed.place)
    }
    return seed.owner && seed.person && seed.place ? seed : null
  } catch {
    return null
  }
}

export function forgetSeed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    void 0
  }
}

async function digest(input: string, length: number): Promise<string> {
  const bytes = new TextEncoder().encode(input)

  if (globalThis.crypto?.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length)
  }

  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0').slice(0, length)
}

function nodeId(label: string, kind: NodeKind): Promise<string> {
  return digest(`${label}|${kind}`, 6).then(hex => `n_${hex}`)
}

function edgeId(from: string, to: string, rel: string): Promise<string> {
  return digest(`${from}|${to}|${rel}`, 4).then(hex => `e_${hex}`)
}

function phonologyFor(label: string) {
  if (!cueable(label)) return undefined
  return { syllables: syllables(label), firstSyllable: firstSyllable(label) }
}

export async function buildSeedGraph(seed: Seed): Promise<{ graph: LifeGraph; scenes: Scene[] }> {
  const ownerId = await nodeId(seed.owner, 'person')
  const personId = await nodeId(seed.person, 'person')
  const placeId = await nodeId(seed.place, 'place')

  const declared: Provenance = {
    source: 'family',
    ref: 'primeiro acesso',
    detail: 'você respondeu no primeiro acesso'
  }

  const kinship = await edgeId(ownerId, personId, 'close_to')
  const residence = await edgeId(personId, placeId, 'lives_in')

  const nodes: Record<string, GraphNode> = {
    [ownerId]: {
      id: ownerId,
      label: seed.owner,
      kind: 'person',
      attrs: {},
      layout: { x: 0.5, y: 0.5 }
    },
    [personId]: {
      id: personId,
      label: seed.person,
      kind: 'person',
      attrs: {
        family: 'é uma pessoa próxima de você',
        city: `mora em ${seed.place}`
      },
      phon: phonologyFor(seed.person),
      layout: { x: 0.76, y: 0.28 }
    },
    [placeId]: {
      id: placeId,
      label: seed.place,
      kind: 'place',
      attrs: {
        category: 'é um lugar no mapa',
        region: `é onde ${seed.person} mora`
      },
      phon: phonologyFor(seed.place),
      layout: { x: 0.28, y: 0.72 }
    }
  }

  const edges: GraphEdge[] = [
    {
      id: kinship,
      from: ownerId,
      to: personId,
      rel: 'close_to',
      weight: 0.92,
      provenance: [declared]
    },
    {
      id: residence,
      from: personId,
      to: placeId,
      rel: 'lives_in',
      weight: 0.74,
      provenance: [declared]
    }
  ]

  const graph: LifeGraph = {
    owner: ownerId,
    nodes,
    edges,
    ladderPlans: {
      [personId]: [
        { attr: 'family', edge: kinship },
        { attr: 'city', edge: residence }
      ],
      [placeId]: [
        { attr: 'category', edge: residence },
        { attr: 'region', edge: residence }
      ]
    }
  }

  const scenes: Scene[] = [
    {
      targetId: personId,
      speaker: 'alguém na mesa',
      prompt: 'Quem que vem no domingo?',
      attempt: 'É a… a…'
    },
    {
      targetId: placeId,
      speaker: 'alguém na mesa',
      prompt: 'E ela mora onde mesmo?',
      attempt: 'Lá em… em…'
    }
  ]

  return { graph, scenes }
}
