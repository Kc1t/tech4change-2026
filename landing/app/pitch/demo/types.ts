import type { CuePlan } from '../eilo/types'

export type CueOrigin = 'offline' | CuePlan['origin']

export type Network = 'online' | 'offline'

export type CuePhase = 'idle' | 'cue' | 'success' | 'given'

export type DemoCue = {
  phase: CuePhase
  level: number
  total: number
  text: string
  kind?: string
  origin?: CueOrigin
  targetBy?: 'openrouter' | 'offline'
  network?: Network
}

export type MicState = 'off' | 'listening' | 'unsupported' | 'blocked' | 'simulating'

export type EarSource = 'openrouter' | 'browser' | 'off'

export type Activity = 'off' | 'listening' | 'hearing' | 'thinking' | 'helping' | 'recalled'

export type DemoGuess = {
  word: string
  confidence: number
  alternatives: string[]
  origin: 'openrouter' | 'offline'
  inGraph: boolean
  revealed?: boolean
}

export type Latency = { stt: number | null; complete: number | null; cue: number | null }

export type LiveDemoState = {
  mic: MicState
  words: string[]
  cue: DemoCue
  ear: EarSource
  guess: DemoGuess | null
  latency: Latency
  network: Network
  activity: Activity
}

export const IDLE_CUE: DemoCue = { phase: 'idle', level: 0, total: 0, text: '' }

export const INITIAL_STATE: LiveDemoState = {
  mic: 'off',
  words: [],
  cue: IDLE_CUE,
  ear: 'off',
  guess: null,
  latency: { stt: null, complete: null, cue: null },
  network: 'online',
  activity: 'off'
}
