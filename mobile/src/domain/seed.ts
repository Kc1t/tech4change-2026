import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'
import { genderOf } from './kinship'
import { cueable, firstSyllable, syllables } from './phonology'
import type { GraphEdge, GraphNode, LifeGraph, NodeKind, Provenance, Scene } from './types'

const MAX_ANSWER = 40

export interface Seed {
  owner: string
  person: string
  place: string
  relation?: string
  object?: string
  activity?: string
}

export type SeedKey = keyof Seed

export const DEMO_SEED: Seed = {
  owner: 'Helena',
  person: 'Letícia',
  relation: 'neta',
  place: 'Sorocaba',
  object: 'escumadeira',
  activity: 'almoço de domingo'
}

export function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_ANSWER) : ''
}

export function parseSeed(parsed: Record<string, unknown>): Seed | null {
  const seed: Seed = {
    owner: clean(parsed.owner),
    person: clean(parsed.person),
    place: clean(parsed.place),
    relation: clean(parsed.relation) || undefined,
    object: clean(parsed.object) || undefined,
    activity: clean(parsed.activity) || undefined
  }
  return seed.owner && seed.person && seed.place ? seed : null
}

export function isComplete(answers: Partial<Seed>): boolean {
  return Boolean(clean(answers.owner) && clean(answers.person) && clean(answers.place))
}

async function digest(input: string, length: number): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length)
  }

  const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, input).catch(() => sha256(input))
  return hex.slice(0, length)
}

function firstPrimes(count: number): number[] {
  const primes: number[] = []
  for (let candidate = 2; primes.length < count; candidate++) {
    if (primes.every(prime => candidate % prime !== 0)) primes.push(candidate)
  }
  return primes
}

const fractionBits = (value: number) => ((value % 1) * 2 ** 32) >>> 0
const PRIMES = firstPrimes(64)
const ROUND_CONSTANTS = PRIMES.map(prime => fractionBits(Math.cbrt(prime)))
const INITIAL_STATE = PRIMES.slice(0, 8).map(prime => fractionBits(Math.sqrt(prime)))

function rotate(word: number, bits: number): number {
  return (word >>> bits) | (word << (32 - bits))
}

function sha256(input: string): string {
  const bytes = Array.from(new TextEncoder().encode(input))
  const bitLength = bytes.length * 8
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  for (let shift = 56; shift >= 0; shift -= 8) bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff)

  const state = [...INITIAL_STATE]
  const words: number[] = []

  for (let block = 0; block < bytes.length; block += 64) {
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        const at = block + i * 4
        words[i] = (bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!
        continue
      }
      const early = words[i - 15]!
      const late = words[i - 2]!
      const sigma0 = rotate(early, 7) ^ rotate(early, 18) ^ (early >>> 3)
      const sigma1 = rotate(late, 17) ^ rotate(late, 19) ^ (late >>> 10)
      words[i] = (words[i - 16]! + sigma0 + words[i - 7]! + sigma1) | 0
    }

    let work = [...state]
    for (let i = 0; i < 64; i++) {
      const [a, b, c, d, e, f, g, h] = work
      const t1 = (h + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) + ((e & f) ^ (~e & g)) + ROUND_CONSTANTS[i]! + words[i]!) | 0
      const t2 = ((rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0
      work = [(t1 + t2) | 0, a, b, c, (d + t1) | 0, e, f, g]
    }
    work.forEach((word, i) => {
      state[i] = (state[i]! + word) | 0
    })
  }

  return state.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('')
}

function nodeId(label: string, kind: NodeKind): Promise<string> {
  return digest(`${label}|${kind}`, 6).then(hex => `n_${hex}`)
}

function edgeId(from: string, to: string, rel: string): Promise<string> {
  return digest(`${from}|${to}|${rel}`, 4).then(hex => `e_${hex}`)
}

function phonologyFor(label: string) {
  const head = label.trim().split(/[\s-]+/)[0] ?? ''
  if (!cueable(head)) return undefined
  return { syllables: syllables(head), firstSyllable: firstSyllable(head) }
}

export async function buildSeedGraph(seed: Seed): Promise<{ graph: LifeGraph; scenes: Scene[] }> {
  const ownerId = await nodeId(seed.owner, 'person')
  const namesakeId = await nodeId(seed.person, 'person')
  const personId = namesakeId === ownerId ? await nodeId(`${seed.person}|2`, 'person') : namesakeId
  const placeId = await nodeId(seed.place, 'place')
  const gender = genderOf(seed.relation)

  const declared: Provenance = {
    source: 'family',
    ref: 'primeiro acesso',
    detail: 'você respondeu no primeiro acesso'
  }

  const kinship = await edgeId(ownerId, personId, 'close_to')
  const residence = await edgeId(personId, placeId, 'lives_in')

  const bond = seed.relation
    ? `é ${gender === 'ela' ? 'a sua' : 'o seu'} ${seed.relation.toLowerCase()}`
    : 'é uma pessoa próxima de você'

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
      attrs: { family: bond, city: `mora em ${seed.place}` },
      phon: phonologyFor(seed.person),
      layout: { x: 0.76, y: 0.28 }
    },
    [placeId]: {
      id: placeId,
      label: seed.place,
      kind: 'place',
      attrs: { category: 'é um lugar no mapa', region: `é onde ${seed.person} mora` },
      phon: phonologyFor(seed.place),
      layout: { x: 0.28, y: 0.72 }
    }
  }

  const edges: GraphEdge[] = [
    { id: kinship, from: ownerId, to: personId, rel: 'close_to', weight: 0.92, provenance: [declared] },
    { id: residence, from: personId, to: placeId, rel: 'lives_in', weight: 0.74, provenance: [declared] }
  ]

  const ladderPlans: LifeGraph['ladderPlans'] = {
    [personId]: [
      { attr: 'family', edge: kinship },
      { attr: 'city', edge: residence }
    ],
    [placeId]: [
      { attr: 'category', edge: residence },
      { attr: 'region', edge: residence }
    ]
  }

  const scenes: Scene[] = [
    {
      targetId: personId,
      speaker: 'alguém na mesa',
      prompt: 'Quem que vem no domingo?',
      attempt: gender === 'ela' ? 'É a… a…' : gender === 'ele' ? 'É o… o…' : 'É… é…'
    },
    {
      targetId: placeId,
      speaker: 'alguém na mesa',
      prompt: `E ${gender ?? seed.person} mora onde mesmo?`,
      attempt: 'Lá em… em…'
    }
  ]

  if (seed.object) {
    const objectId = await nodeId(seed.object, 'object')
    const handles = await edgeId(ownerId, objectId, 'uses')

    nodes[objectId] = {
      id: objectId,
      label: seed.object,
      kind: 'object',
      attrs: { category: 'é uma coisa que você pega todo dia', use: 'fica sempre por perto' },
      phon: phonologyFor(seed.object),
      layout: { x: 0.22, y: 0.3 }
    }
    edges.push({
      id: handles,
      from: ownerId,
      to: objectId,
      rel: 'uses',
      weight: 0.7,
      provenance: [declared]
    })
    ladderPlans[objectId] = [
      { attr: 'category', edge: handles },
      { attr: 'use', edge: handles }
    ]
    scenes.push({
      targetId: objectId,
      speaker: 'alguém em casa',
      prompt: 'Você viu onde foi parar?',
      attempt: genderOf(seed.object) === 'ela' ? 'A… a…' : 'O… o…'
    })
  }

  if (seed.activity) {
    const activityId = await nodeId(seed.activity, 'event')
    const shares = await edgeId(ownerId, activityId, 'shares')

    nodes[activityId] = {
      id: activityId,
      label: seed.activity,
      kind: 'event',
      attrs: {
        category: 'é algo que vocês fazem juntos',
        who: `é com ${seed.person}`
      },
      phon: phonologyFor(seed.activity),
      layout: { x: 0.74, y: 0.74 }
    }
    edges.push({
      id: shares,
      from: ownerId,
      to: activityId,
      rel: 'shares',
      weight: 0.68,
      provenance: [declared]
    })
    ladderPlans[activityId] = [
      { attr: 'category', edge: shares },
      { attr: 'who', edge: shares }
    ]
    scenes.push({
      targetId: activityId,
      speaker: 'alguém na mesa',
      prompt: 'O que vocês fizeram no fim de semana?',
      attempt: 'A gente foi… foi…'
    })
  }

  return { graph: { owner: ownerId, nodes, edges, ladderPlans }, scenes }
}
