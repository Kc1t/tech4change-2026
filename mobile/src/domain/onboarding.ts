import { FEMININE, MASCULINE, genderOf } from './kinship'
import { clean, type Seed, type SeedKey } from './seed'

export type Ask = 'intro' | 'person' | 'relation' | 'place' | 'extras'

const RELATIONS = [...FEMININE, ...MASCULINE].join('|')
const RELATION_WORD = new RegExp(`(?:^|[^\\p{L}])(${RELATIONS})(?!\\p{L})`, 'iu')
const DONT_KNOW = /^(?:(?:n[ãa]o\s+(?:sei|lembro|tenho|conhe[çc]o)|sei\s+l[áa]|esqueci|nada|ningu[ée]m|nenhuma?)(?!\p{L})|n[ãa]o[\s,]*$)/iu

const NAME = "[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]+"
const STOP = new Set(['a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'que', 'eu', 'sou', 'meu', 'minha', 'lá', 'ela', 'ele'])

export const SUGGESTIONS: Record<Ask, string[]> = {
  intro: [],
  person: [],
  relation: ['filha', 'neto', 'esposa', 'amiga'],
  place: [],
  extras: ['almoço de domingo', 'caminhada', 'novela']
}

export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word, index) => (index > 0 && STOP.has(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export function nextAsk(answers: Partial<Seed>, skipped: Set<Ask>): Ask | null {
  if (!answers.owner) return 'intro'
  if (!answers.person) return 'person'
  if (!answers.relation && !skipped.has('relation')) return 'relation'
  if (!answers.place) return 'place'
  if (!answers.activity && !answers.object && !skipped.has('extras')) return 'extras'
  return null
}

export function questionFor(ask: Ask, answers: Partial<Seed>): string {
  const owner = answers.owner
  const person = answers.person
  const pronoun = genderOf(answers.relation)
  switch (ask) {
    case 'intro':
      return answers.person ? 'E como a gente te chama?' : 'Me conta: como te chamam, e quem você mais vê na semana?'
    case 'person':
      return `${owner ? `Prazer, ${owner}. ` : ''}Quem é alguém que você vê toda semana?`
    case 'relation':
      return `Quem é ${person} para você?`
    case 'place':
      return `E ${pronoun ?? person} mora em qual cidade?`
    case 'extras':
      return 'Pra fechar: o que vocês fazem juntos? Pode ser o almoço de domingo, uma caminhada.'
  }
}

export function isOptional(ask: Ask): boolean {
  return ask === 'relation' || ask === 'extras'
}

function first(pattern: RegExp, text: string): string | undefined {
  return pattern.exec(text)?.[1]?.trim()
}

export function parseLocally(message: string, ask: Ask, known: Partial<Seed>): Partial<Seed> {
  const text = message.replace(/[.!?;]+/g, ',').trim()
  if (DONT_KNOW.test(text)) return {}
  const found: Partial<Seed> = {}

  const owner = first(new RegExp(`(?:me chamo|meu nome é|aqui é|sou)\\s+(?:a\\s+|o\\s+)?(${NAME})`, 'i'), text)
  if (owner && !STOP.has(owner.toLowerCase())) found.owner = owner

  const bond = new RegExp(`(?:minha|meu)\\s+(${RELATIONS}),?\\s+(?:a |o )?(${NAME})`, 'i').exec(text)
  if (bond) {
    found.relation = bond[1]!.toLowerCase()
    found.person = bond[2]
  }

  const place = first(new RegExp(`(?:mora|vive)\\s+(?:lá\\s+)?(?:em|no|na)\\s+(${NAME}(?:\\s+(?:de|do|da)?\\s*${NAME})?)`, 'i'), text)
  if (place) found.place = place.split(/\s+(?:e|mas|com)\s+/i)[0]

  const object = first(/(?:uso|pego|mexo com|mexer com)\s+(?:muito\s+)?(?:a |o |na |no )?([a-zà-ÿ]+(?:\s+de\s+[a-zà-ÿ]+)?)/i, text)
  if (object) found.object = object.toLowerCase()

  const bare = text.replace(/^(?:é |a |o |em |na |no |lá em )/i, '').split(',')[0]!.trim()
  const short = bare.split(/\s+/).length <= 4

  if (ask === 'intro' && !found.owner && short) found.owner = bare
  if (ask === 'person' && !found.person && short) found.person = bare.replace(/^(?:minha|meu)\s+/i, '')
  if (ask === 'relation' && !found.relation) found.relation = first(RELATION_WORD, text)?.toLowerCase() ?? (short ? bare.toLowerCase() : undefined)
  if (ask === 'place' && !found.place && short) found.place = bare
  if (ask === 'extras' && !found.activity) {
    const activity = text.split(',')[0]!.replace(/^(?:a gente|nós|eu e (?:ela|ele))\s+(?:faz|fazemos|vai|vamos)?\s*(?:o |a )?/i, '').trim()
    if (activity && activity.split(/\s+/).length <= 5) found.activity = activity.toLowerCase()
  }

  return tidy(found, known)
}

export function tidy(found: Partial<Seed>, known: Partial<Seed>): Partial<Seed> {
  const next: Partial<Seed> = {}
  for (const [key, raw] of Object.entries(found) as Array<[SeedKey, string | undefined]>) {
    const value = clean(raw)
    if (!value || known[key]) continue
    next[key] = key === 'owner' || key === 'person' || key === 'place' ? titleCase(value) : value.toLowerCase()
  }
  return next
}

export function warmReply(found: Partial<Seed>): string {
  if (found.activity) return `${found.activity.charAt(0).toUpperCase()}${found.activity.slice(1)}, que bom.`
  if (found.place) return `${found.place}, anotado.`
  if (found.person) return `Que bom ter ${found.person} por perto.`
  if (found.owner) return `Prazer, ${found.owner}.`
  return 'Anotado.'
}

export function scriptFor(seed: Partial<Seed>): string[] {
  return [
    `Sou a ${seed.owner}. Minha ${seed.relation} ${seed.person} vem toda semana`,
    `${seed.place}`,
    `${seed.activity}, e eu uso muito a ${seed.object}`
  ]
}
