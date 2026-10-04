import type { Rung } from '../eilo/guess-safety'
import { normalise } from '../eilo/predict'
import type { GraphNode, HelpCall, LadderStep } from '../eilo/types'
import { countPlainMentions } from './text'
import type { CueOrigin, DemoCue, Network } from './types'

export type TargetSource = NonNullable<DemoCue['targetBy']>

export type Verdict = { frustration: number; help: HelpCall | null; stalled: boolean }

export type Aim = {
  target: GraphNode
  ladder: LadderStep[]
  rungs: Rung[]
  origin: CueOrigin
  targetBy: TargetSource
  baseline: number
  wordMark: number
}

export class HelpSession {
  target: GraphNode
  ladder: LadderStep[]
  rungs: Rung[]
  origin: CueOrigin
  targetBy: TargetSource
  baseline: number
  wordMark: number
  confidence: number
  level = 0
  startLevel = 0
  lastCueAt = 0
  cueWordMark = 0
  verdict: Verdict | null = null
  assessedText = ''
  assessing = false
  openingStruggle = 0
  private readonly candidates = new Map<string, { label: string; baseline: number }>()

  constructor(aim: Aim, confidence: number) {
    this.target = aim.target
    this.ladder = aim.ladder
    this.rungs = aim.rungs
    this.origin = aim.origin
    this.targetBy = aim.targetBy
    this.baseline = aim.baseline
    this.wordMark = aim.wordMark
    this.confidence = confidence
  }

  retarget(aim: Aim) {
    this.target = aim.target
    this.ladder = aim.ladder
    this.rungs = aim.rungs
    this.origin = aim.origin
    this.targetBy = aim.targetBy
    this.baseline = aim.baseline
    this.wordMark = aim.wordMark
  }

  get wordLevel(): number {
    return this.rungs.length - 1
  }

  get lastHintLevel(): number {
    return Math.max(0, this.rungs.length - 2)
  }

  startLevelFor(lastRecall: number | null | undefined): number {
    if (lastRecall === null || lastRecall === undefined) return 0
    return Math.max(0, Math.min(lastRecall - 1, this.lastHintLevel))
  }

  strongestLevel(): number {
    const sound = this.rungs.findIndex(rung => rung.kind === 'phonological')
    const strongest = sound >= 0 ? sound : this.wordLevel - 1
    return strongest > this.level ? strongest : Math.min(this.level + 1, this.wordLevel)
  }

  cueAt(level: number, network: Network): DemoCue {
    const rung = this.rungs[level]
    return {
      phase: level >= this.wordLevel ? 'given' : 'cue',
      level,
      total: this.rungs.length,
      text: rung?.text ?? '',
      kind: rung?.kind,
      origin: this.origin,
      targetBy: this.targetBy,
      network
    }
  }

  addCandidates(words: string[], spoken: string) {
    for (const word of words) {
      const key = normalise(word)
      if (!key || this.candidates.has(key)) continue
      this.candidates.set(key, { label: word, baseline: countPlainMentions(spoken, word) })
    }
  }

  candidateSaid(spoken: string): string | null {
    for (const candidate of this.candidates.values()) {
      if (countPlainMentions(spoken, candidate.label) > candidate.baseline) return candidate.label
    }
    return null
  }
}
