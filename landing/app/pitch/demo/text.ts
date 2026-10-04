import { normalise } from '../eilo/predict'
import { tokensOf } from '../eilo/text-safety'
import type { GraphNode } from '../eilo/types'

const NEGATIONS = new Set(['nao', 'nem'])

export function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

export function lastWords(text: string, count: number): string {
  return wordsOf(text).slice(-count).join(' ')
}

export function wordsFrom(text: string, mark: number): string {
  return wordsOf(text).slice(mark).join(' ')
}

export function labelsOf(node: GraphNode): string[] {
  return [node.label, ...(node.aliases ?? [])]
}

export function namesOf(node: GraphNode): string[] {
  return labelsOf(node).map(normalise)
}

function nearlySame(heard: string, name: string): boolean {
  if (heard === name) return true
  if (name.length < 5 || Math.abs(heard.length - name.length) > 1) return false
  let i = 0
  while (i < heard.length && heard[i] === name[i]) i += 1
  const a = heard.slice(i)
  const b = name.slice(i)
  return a.slice(1) === b.slice(1) || a.slice(1) === b || a === b.slice(1)
}

function occurrences(spoken: string[], word: string, accept: (at: number) => boolean = () => true): number {
  const parts = tokensOf(word)
  if (parts.length === 0) return 0
  let found = 0
  for (let at = 0; at + parts.length <= spoken.length; at += 1) {
    if (parts.every((part, j) => nearlySame(spoken[at + j], part)) && accept(at)) found += 1
  }
  return found
}

export function countMentions(text: string, names: string[]): number {
  const spoken = tokensOf(text)
  return names.reduce((total, name) => total + occurrences(spoken, name), 0)
}

const GREETING = /^(ola|oi|alo|ei|ai|hey)$/
const PLAIN_GREETING = /^(ola|oi|alo|hey)$/
const EILO = /^(eilo|eilu|ailo|ailu|eiro|airo|eylo|eylu|hilo|heilo|elo|elu|helio|elio|eliu)$/
const EILO_HEARD_AS = /^(h?[aeiy]{0,2}l{1,2}[aeiouw]?|h?e[iy]|h?eli[ou])$/

export function greetsEilo(text: string): boolean {
  const tokens = tokensOf(text)
  return tokens.some((token, n) => {
    const next = tokens[n + 1] ?? ''
    return (GREETING.test(token) && EILO.test(next)) || (PLAIN_GREETING.test(token) && EILO_HEARD_AS.test(next))
  })
}

export function greetingEnd(words: string[]): number | null {
  if (!greetsEilo(words.join(' '))) return null
  for (let end = 1; end <= words.length; end += 1) if (greetsEilo(words.slice(0, end).join(' '))) return end
  return null
}

export function reachesFor(text: string, names: string[]): boolean {
  const last = tokensOf(text).at(-1) ?? ''
  return last.length >= 2 && names.some(name => tokensOf(name)[0]?.startsWith(last))
}

export function countPlainMentions(text: string, word: string): number {
  const spoken = tokensOf(text)
  return occurrences(spoken, word, at => !spoken.slice(Math.max(0, at - 2), at).some(token => NEGATIONS.has(token)))
}
