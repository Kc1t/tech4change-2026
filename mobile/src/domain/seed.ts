import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'
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

export const SEED_QUESTIONS: Array<{
  key: SeedKey
  question: string
  note: string
  placeholder: string
  optional?: boolean
}> = [
  {
    key: 'owner',
    question: 'Como a gente te chama?',
    note: 'Só o primeiro nome basta.',
    placeholder: 'seu nome'
  },
  {
    key: 'person',
    question: 'O nome de alguém que você vê toda semana.',
    note: 'Alguém que aparece muito na sua vida.',
    placeholder: 'um nome'
  },
  {
    key: 'relation',
    question: 'Quem essa pessoa é para você?',
    note: 'Filha, neto, vizinha, amigo.',
    placeholder: 'o parentesco',
    optional: true
  },
  {
    key: 'place',
    question: 'Em que cidade essa pessoa mora?',
    note: 'A cidade ajuda a montar uma dica.',
    placeholder: 'uma cidade'
  },
  {
    key: 'object',
    question: 'Uma coisa que você pega todo dia.',
    note: 'O chinelo, a bengala, o controle.',
    placeholder: 'uma coisa',
    optional: true
  },
  {
    key: 'activity',
    question: 'Algo que vocês fazem juntos.',
    note: 'O almoço de domingo, a caminhada.',
    placeholder: 'o que vocês fazem',
    optional: true
  }
]

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

  const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, input)
  return hex.slice(0, length)
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

  const bond = seed.relation
    ? `é ${article(seed.relation)} ${seed.relation.toLowerCase()}`
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
      attempt: 'É a… a…'
    },
    {
      targetId: placeId,
      speaker: 'alguém na mesa',
      prompt: 'E ela mora onde mesmo?',
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
      attempt: 'O… o…'
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

function article(relation: string): string {
  return /^(filha|neta|irmã|mãe|vizinha|amiga|esposa|prima|tia|sobrinha|nora|cunhada)/i.test(
    relation
  )
    ? 'a sua'
    : 'o seu'
}
