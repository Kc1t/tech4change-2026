export type Gender = 'ela' | 'ele'

export const FEMININE = new Set([
  'filha', 'neta', 'esposa', 'mulher', 'irmã', 'sobrinha', 'nora', 'amiga', 'vizinha', 'mãe', 'cuidadora', 'tia', 'prima', 'avó', 'madrinha',
  'cunhada', 'sogra', 'namorada', 'companheira', 'bisneta', 'enteada', 'afilhada'
])

export const MASCULINE = new Set([
  'filho', 'neto', 'esposo', 'marido', 'irmão', 'sobrinho', 'genro', 'amigo', 'vizinho', 'pai', 'cuidador', 'tio', 'primo', 'avô', 'padrinho',
  'cunhado', 'sogro', 'namorado', 'companheiro', 'bisneto', 'enteado', 'afilhado'
])

const FILLER = new Set(['minha', 'meu', 'a', 'o', 'é', 'melhor'])

export function genderOf(noun?: string): Gender | null {
  const words = noun?.toLowerCase().split(/\s+/).filter(word => word && !FILLER.has(word)) ?? []
  const known = words.find(word => FEMININE.has(word) || MASCULINE.has(word))
  if (known) return FEMININE.has(known) ? 'ela' : 'ele'
  const head = words[0] ?? ''
  if (/[aã]$/.test(head)) return 'ela'
  if (/o$/.test(head)) return 'ele'
  return null
}
