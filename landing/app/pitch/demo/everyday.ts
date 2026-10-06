import { tokensOf } from '../eilo/text-safety'

export type EverydayWord = { word: string; cue: string }

const MIN_HITS = 2

const LEXICON: Array<EverydayWord & { signs: string[] }> = [
  { word: 'chave', cue: 'É pequena, de metal, e a gente leva no bolso', signs: ['abrir', 'abre', 'porta', 'trancar', 'tranca', 'fechar', 'fecha', 'fechadura'] },
  { word: 'café', cue: 'É uma bebida que a gente toma para acordar', signs: ['preto', 'quentinho', 'quente', 'manha', 'tomo', 'tomei', 'xicara'] },
  { word: 'óculos', cue: 'Tem duas lentes e fica no rosto', signs: ['enxergar', 'enxergo', 'perto', 'longe', 'ler', 'vista'] }
]

export const SCRIPTED_WORD: EverydayWord = LEXICON[0]

export function everydayWord(said: string): EverydayWord | null {
  const heard = new Set(tokensOf(said))
  const scored = LEXICON.map(entry => ({ entry, hits: entry.signs.filter(sign => heard.has(sign)).length }))
    .filter(item => item.hits >= MIN_HITS && !heard.has(tokensOf(item.entry.word)[0]))
    .sort((a, b) => b.hits - a.hits)
  return scored[0]?.entry ?? null
}
