import graphData from '../eilo/graph.json'
import type { LifeGraph, NodeId } from '../eilo/types'

export const lifeGraph = graphData as unknown as LifeGraph

export const SCRIPTED_TARGET: NodeId = 'n_fd8f8a'

export const TIMING = {
  tickMs: 100,
  segmentGapMs: 1100,
  calmNextMs: 3000,
  hesitantNextMs: 3000,
  frustratedNextMs: 2000,
  struggleSilenceMs: 700,
  assessWaitMs: 2000,
  talkQuietMs: 3000,
  minCueGapMs: 700,
  resultHoldMs: 3500,
  repeatGuardMs: 15_000,
  outcomeEchoMs: 300,
  vadAliveMs: 6000,
  settleMs: 1500,
  aheadSilenceMs: 250,
  aheadRetryMs: 1500,
  modelFirstMs: 1500,
  completeTimeoutMs: 7000,
  cueTimeoutMs: 8000,
  earRetryMs: 20_000,
  deafTailMs: 900,
  hearingMs: 600,
  thinkingSilenceMs: 600,
  browserRestartMs: 250
} as const

export const THRESHOLDS = {
  strongFrustration: 0.7,
  fastFrustration: 0.45,
  hesitantFrustration: 0.3,
  calmFrustration: 0.3,
  openingFrustrationCap: 0.6,
  freeWordConfidence: 0.5,
  wordFrustration: 0.6,
  retargetConfidence: 0.6
} as const

export const WORD_COUNTS = {
  visible: 24,
  recent: 30,
  talk: 3,
  drift: 5,
  segmentChars: 2000,
  segmentWords: 300
} as const

export const ROUTES = {
  complete: '/pitch/api/complete',
  cue: '/pitch/api/cue',
  transcribe: '/pitch/api/transcribe',
  speak: '/pitch/api/speak'
} as const
