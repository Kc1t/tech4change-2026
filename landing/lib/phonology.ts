const VOWELS = new Set('aeiouáéíóúâêôãõàü')
const STRONG = new Set('aeoáéóâêô')
const DIGRAPHS = ['ch', 'lh', 'nh', 'qu', 'gu']
const CLUSTERS = [
  'bl', 'br', 'cl', 'cr', 'dl', 'dr', 'fl', 'fr',
  'gl', 'gr', 'pl', 'pr', 'tl', 'tr', 'vl', 'vr'
]

function isVowel(char: string): boolean {
  return VOWELS.has(char.toLowerCase())
}

function isHiatus(pair: string): boolean {
  if (pair.length < 2) return false
  return STRONG.has(pair[pair.length - 2]!) && STRONG.has(pair[pair.length - 1]!)
}

function onsetStart(run: string): number {
  if (run.length <= 1) return 0
  const tail = run.slice(-2)
  if (DIGRAPHS.includes(tail) || CLUSTERS.includes(tail)) return run.length - 2
  return run.length - 1
}

export function syllables(word: string): string[] {
  const text = word.trim()
  if (!text) return []

  const lowered = text.toLowerCase()
  const breaks: number[] = []
  let i = 0

  while (i < lowered.length) {
    if (!isVowel(lowered[i]!)) {
      i += 1
      continue
    }

    let j = i + 1
    while (j < lowered.length && isVowel(lowered[j]!) && !isHiatus(lowered.slice(i, j + 1))) j += 1

    let consonants = j
    while (consonants < lowered.length && !isVowel(lowered[consonants]!)) consonants += 1

    if (consonants >= lowered.length) break

    breaks.push(j + onsetStart(lowered.slice(j, consonants)))
    i = consonants
  }

  const pieces: string[] = []
  let previous = 0
  for (const point of breaks) {
    if (point > previous) {
      pieces.push(text.slice(previous, point))
      previous = point
    }
  }
  pieces.push(text.slice(previous))

  return pieces.filter(Boolean)
}

export function firstSyllable(word: string): string {
  const parts = syllables(word)
  if (parts.length === 0) return word.slice(0, 2)
  if (parts[0]!.length === 1 && parts.length > 2) return parts[0]! + parts[1]!
  return parts[0]!
}
