import { LIMITS } from './limits'

export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tokensOf(text: string): string[] {
  const folded = fold(text)
  return folded ? folded.split(' ') : []
}

export function clampConfidence(value: unknown): number {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0
}

export function cleanTranscript(raw: unknown, maxChars: number = LIMITS.transcriptChars, maxWords: number = LIMITS.transcriptWords): string {
  if (typeof raw !== 'string') return ''
  const words = raw
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
    .replace(/[^\p{L}\p{M}\p{N}\s.,;:!?…'’()-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-maxWords)
  let text = words.join(' ')
  if (text.length > maxChars) text = text.slice(text.length - maxChars).replace(/^\S*\s*/, '')
  return text
}

const HALLUCINATIONS = [
  /obrigad[oa]s? (a todos )?(por|pela) (assistir|atencao|assistirem)/,
  /legendas? (pela|por|da|de)/,
  /legendad[oa] por/,
  /amara org/,
  /inscreva se/,
  /se inscrev/,
  /ative o sininho/,
  /deix[ae] (o )?(seu )?like/,
  /ate o proximo video/,
  /transcricao (feita )?por/,
  /traducao (feita )?por/,
  /\bwww\b|\bhttps?\b|\bcom br\b/,
  /thanks? (you )?for watching/,
  /subtitles? by/,
  /sous titres/,
  /adriana zanotto/
]

const STANDALONE_NOISE = new Set([
  'obrigado',
  'obrigada',
  'obrigado a todos',
  'muito obrigado',
  'muito obrigada',
  'tchau',
  'tchau tchau',
  'ate a proxima',
  'ate mais',
  'ate logo',
  'musica',
  'risos',
  'aplausos',
  'silencio',
  'legenda',
  'legendas',
  'you',
  'thank you',
  'bye',
  'hum',
  'hmm',
  'humm',
  'ah',
  'eh',
  'uh',
  'e ai'
])

export type DiscardReason = 'empty' | 'noise' | 'hallucination' | 'repetition' | 'script'

export function hallucinationReason(text: string): DiscardReason | null {
  if (/[♪♫]|\[(m[uú]sica|music|risos|aplausos)\]|\((m[uú]sica|music|risos|aplausos)\)/i.test(text)) return 'noise'
  const letters = [...text.normalize('NFD').replace(/[̀-ͯ]/g, '')].filter(ch => /\p{L}/u.test(ch))
  if (letters.length === 0) return 'empty'
  const latin = letters.filter(ch => /[a-z]/i.test(ch)).length
  if (latin / letters.length < 0.7) return 'script'
  const folded = fold(text)
  if (STANDALONE_NOISE.has(folded)) return 'noise'
  if (HALLUCINATIONS.some(pattern => pattern.test(folded))) return 'hallucination'
  const tokens = folded.split(' ')
  let run = 1
  for (let i = 1; i < tokens.length; i += 1) {
    run = tokens[i] === tokens[i - 1] ? run + 1 : 1
    if (run >= 4) return 'repetition'
  }
  if (tokens.length >= 8 && new Set(tokens).size / tokens.length < 0.3) return 'repetition'
  return null
}

export function screenTranscript(
  raw: unknown,
  maxChars: number = LIMITS.transcriptChars,
  maxWords: number = LIMITS.transcriptWords
): { text: string; discarded: DiscardReason | null } {
  const text = cleanTranscript(raw, maxChars, maxWords)
  const discarded = hallucinationReason(text)
  return discarded ? { text: '', discarded } : { text, discarded: null }
}

const BLOCKED = new Set([
  'porra', 'caralho', 'krl', 'crl', 'merda', 'bosta', 'puta', 'puto', 'putas', 'putaria', 'pqp', 'fdp', 'vsf', 'tnc', 'foda',
  'fodase', 'foder', 'fodido', 'fodida', 'buceta', 'boceta', 'xoxota', 'xereca', 'cu', 'cuzao', 'viado', 'bicha', 'arrombado',
  'arrombada', 'cacete', 'piroca', 'pica', 'punheta', 'babaca', 'otario', 'otaria', 'idiota', 'imbecil', 'retardado',
  'retardada', 'vagabunda', 'vagabundo', 'vadia', 'safada', 'corno', 'crioulo', 'sapatao', 'traveco', 'nazista', 'nazi',
  'hitler', 'estupro', 'estuprar', 'estuprador', 'suicidio', 'suicidar', 'cocaina', 'maconha', 'heroina', 'crack', 'sexo',
  'transar', 'porno', 'pornografia', 'nude', 'nudes', 'assassinar', 'fuck', 'fucking', 'shit', 'bitch', 'cunt',
  'dick', 'cock', 'pussy', 'nigger', 'nigga', 'fag', 'faggot', 'retard', 'whore', 'slut', 'rape', 'kill', 'sex', 'porn'
])

const BLOCKED_STEMS = ['caralh', 'arromb', 'estupr', 'punhet', 'fuck', 'shit', 'nigg', 'porra', 'fodid', 'putari', 'buceta']

export function isOffensive(text: string): boolean {
  return tokensOf(text).some(token => BLOCKED.has(token) || BLOCKED_STEMS.some(stem => token.startsWith(stem)))
}

export function maskOffensive(text: string): string {
  return text
    .split(/(\s+)/)
    .map(part => (part.trim() && isOffensive(part) ? '•••' : part))
    .join('')
}

export function sanitizeForPrompt(transcript: string): string {
  return cleanTranscript(transcript).replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
}
