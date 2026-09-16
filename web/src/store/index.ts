'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import graphData from '@/data/graph.json'
import { demoHistory } from '@/domain/demo'
import { BUILT_IN_DEVICES, channelsFrom, DISCOVERABLE, type PairedDevice } from '@/domain/devices'
import { deterministicPlan, buildLadder, resolve, startingLevel } from '@/domain/ladder'
import { CONFIDENCE_FLOOR, EMPTY_PREDICTION, predict, type Prediction } from '@/domain/predict'
import { project } from '@/domain/projection'
import { rankCue, recordEvent } from '@/api/client'
import type { CuePayload, Device } from '@/sync/client'
import type {
  ChannelState,
  CuePlan,
  DiscretionMode,
  HelpLevel,
  LadderStep,
  LearningState,
  LifeGraph,
  Mastery,
  NodeId,
  OutputMode,
  Resolution,
  Scene
} from '@/domain/types'

export let lifeGraph = graphData as unknown as LifeGraph

export let seeded = false

export let SCENES: Scene[] = [
  {
    targetId: 'n_fd8f8a',
    speaker: 'Rodrigo, filho',
    prompt: 'Mãe, quem que vem no domingo?',
    attempt: 'É a minha… a minha…'
  },
  {
    targetId: 'n_52a9aa',
    speaker: 'Marina, filha',
    prompt: 'Mãe, o que a senhora tá procurando?',
    attempt: 'Aquela coisa de… de tirar…'
  },
  {
    targetId: 'n_98b372',
    speaker: 'Letícia, neta',
    prompt: 'Vó, onde a gente passava o ano novo?',
    attempt: 'Lá na… na praia de…'
  },
  {
    targetId: 'n_18a1dd',
    speaker: 'Marina, filha',
    prompt: 'Quem tá latindo aí fora?',
    attempt: 'É o… o…'
  }
]

export function installSeed(graph: LifeGraph, scenes: Scene[]) {
  lifeGraph = graph
  SCENES = scenes
  seeded = true
}

const EMPTY_LEARNING: LearningState = {
  lastLevel: null,
  successes: 0,
  failures: 0,
  lastSeen: null,
  nextReview: null,
  mastery: 'unseen'
}

function activeChannel(channels: ChannelState): 'phone' | 'earbuds' | 'watch' | 'none' {
  if (channels.earbuds) return 'earbuds'
  if (channels.watch) return 'watch'
  if (channels.phone) return 'phone'
  return 'none'
}

function nextMastery(current: Mastery, levelsUsed: number, total: number): Mastery {
  if (levelsUsed <= 1) return 'high'
  if (levelsUsed <= Math.ceil(total / 2)) return 'medium'
  return current === 'unseen' ? 'low' : current
}

const HISTORY_CAP = 240

interface AppState {
  sceneIndex: number
  ladder: LadderStep[]
  level: number
  open: boolean
  origin: CuePlan['origin']
  startedAt: number | null
  channels: ChannelState
  paired: PairedDevice[]
  discretion: DiscretionMode
  intensity: number
  helpLevel: HelpLevel
  output: OutputMode
  confirmations: Record<NodeId, boolean>
  sessionCode: string | null
  deviceId: string | null
  devices: Device[]
  lastCue: CuePayload | null
  learning: Record<NodeId, LearningState>
  history: Resolution[]
  unseenLearning: NodeId[]
  demo: boolean
  cueRequest: number
  memoryFilter: NodeId | null
  prediction: Prediction

  scene: () => Scene
  target: () => NodeId
  learningFor: (id: NodeId) => LearningState
  requestCue: () => void
  hear: (transcript: string) => void
  setMemoryFilter: (id: NodeId | null) => void
  loadDemo: () => void
  clearDemo: () => void
  markLearningSeen: () => void

  start: () => Promise<void>
  advance: () => void
  succeed: (levelUsed?: number) => number
  nextScene: () => void
  toggleDevice: (id: string) => void
  toggleBuzz: (id: string) => void
  pairDevice: (id: string) => void
  unpairDevice: (id: string) => void
  setDiscretion: (mode: DiscretionMode) => void
  setIntensity: (value: number) => void
  setHelpLevel: (level: HelpLevel) => void
  setOutput: (mode: OutputMode) => void
  confirm: (id: NodeId) => void
  setSession: (code: string | null, deviceId: string | null) => void
  setDevices: (devices: Device[]) => void
  setLastCue: (cue: CuePayload | null) => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      sceneIndex: 0,
      ladder: [],
      level: 0,
      open: false,
      origin: 'deterministic',
      startedAt: null,
      channels: channelsFrom(BUILT_IN_DEVICES),
      paired: BUILT_IN_DEVICES,
      discretion: 'discreet',
      intensity: 3,
      helpLevel: 'hint',
      output: 'both',
      confirmations: {},
      sessionCode: null,
      deviceId: null,
      devices: [],
      lastCue: null,
      learning: {},
      history: [],
      unseenLearning: [],
      demo: false,
      cueRequest: 0,
      memoryFilter: null,
      prediction: EMPTY_PREDICTION,

      scene: () => SCENES[get().sceneIndex]!,
      target: () => {
        const { prediction } = get()
        if (
          prediction.targetId &&
          prediction.confidence >= CONFIDENCE_FLOOR &&
          lifeGraph.nodes[prediction.targetId]
        ) {
          return prediction.targetId
        }
        return SCENES[get().sceneIndex]!.targetId
      },
      learningFor: id => get().learning[id] ?? EMPTY_LEARNING,

      requestCue: () => set(state => ({ cueRequest: state.cueRequest + 1 })),

      hear: transcript => {
        if (get().open) return
        const next = transcript.trim() ? predict(lifeGraph, transcript) : EMPTY_PREDICTION
        const current = get().prediction
        if (next.targetId === current.targetId && next.confidence === current.confidence) return
        set({ prediction: next })
      },

      setMemoryFilter: id => set({ memoryFilter: id }),

      loadDemo: () => {
        const history = demoHistory(lifeGraph, Date.now())
        const learning: Record<NodeId, LearningState> = {}

        for (const entry of history) {
          const previous = learning[entry.targetId] ?? EMPTY_LEARNING
          learning[entry.targetId] = {
            lastLevel: entry.level,
            successes: previous.successes + 1,
            failures: 0,
            lastSeen: entry.at,
            nextReview: null,
            mastery: nextMastery(previous.mastery, entry.level, entry.rungs)
          }
        }

        set({ history, learning, demo: true })
      },

      clearDemo: () => set({ history: [], learning: {}, unseenLearning: [], demo: false }),

      markLearningSeen: () => set({ unseenLearning: [] }),

      start: async () => {
        const targetId = get().target()
        const previous = get().learningFor(targetId).lastLevel
        const offline = buildLadder(lifeGraph, deterministicPlan(lifeGraph, targetId))

        set({
          ladder: offline,
          open: true,
          origin: 'deterministic',
          startedAt: Date.now(),
          level: startingLevel(previous, offline.length)
        })

        void recordEvent({
          targetId,
          event: 'block',
          level: 0,
          origin: 'deterministic',
          channel: activeChannel(get().channels),
          elapsedMs: 0
        })

        const heard = get().prediction.mentioned.filter(id => lifeGraph.nodes[id])

        const plan = await rankCue({
          projection: project(lifeGraph),
          activeNodes: [lifeGraph.owner, ...heard].slice(0, 32),
          hints: { kind: lifeGraph.nodes[targetId]!.kind },
          lastLevel: previous
        })

        if (!plan || plan.targetId !== targetId) return
        const ranked = resolve(lifeGraph, plan)
        if (ranked.length === 0) return

        set(state => ({
          ladder: ranked,
          origin: plan.origin,
          level: Math.min(state.level, ranked.length)
        }))
      },

      advance: () => {
        const { level, ladder } = get()
        set({ level: Math.min(level + 1, ladder.length) })
      },

      succeed: levelUsed => {
        const targetId = get().target()
        const { ladder, learning, origin, startedAt, channels } = get()
        const level = levelUsed ?? get().level
        const previous = learning[targetId] ?? EMPTY_LEARNING

        void recordEvent({
          targetId,
          event: 'resolved',
          level,
          origin,
          channel: activeChannel(channels),
          elapsedMs: startedAt ? Date.now() - startedAt : 0
        })

        const at = new Date().toISOString()
        const isNew = learning[targetId] === undefined

        set(state => ({
          open: false,
          unseenLearning:
            isNew && !state.unseenLearning.includes(targetId)
              ? [...state.unseenLearning, targetId]
              : state.unseenLearning,
          history: [...state.history, { at, targetId, level, rungs: ladder.length }].slice(
            -HISTORY_CAP
          ),
          learning: {
            ...learning,
            [targetId]: {
              lastLevel: level,
              successes: previous.successes + 1,
              failures: previous.failures,
              lastSeen: at,
              nextReview: null,
              mastery: nextMastery(previous.mastery, level, ladder.length)
            }
          }
        }))

        return level
      },

      nextScene: () =>
        set(state => ({
          sceneIndex: (state.sceneIndex + 1) % SCENES.length,
          ladder: [],
          level: 0,
          open: false,
          prediction: EMPTY_PREDICTION
        })),

      toggleDevice: id =>
        set(state => {
          const paired = state.paired.map(device =>
            device.id === id ? { ...device, on: !device.on } : device
          )
          return { paired, channels: channelsFrom(paired) }
        }),

      toggleBuzz: id =>
        set(state => {
          const paired = state.paired.map(device =>
            device.id === id ? { ...device, buzz: !device.buzz, on: device.buzz || device.on } : device
          )
          return { paired, channels: channelsFrom(paired) }
        }),

      pairDevice: id =>
        set(state => {
          const found = DISCOVERABLE.find(device => device.id === id)
          if (!found || state.paired.some(device => device.id === id)) return state
          const paired = [...state.paired, found]
          return { paired, channels: channelsFrom(paired) }
        }),

      unpairDevice: id =>
        set(state => {
          const paired = state.paired.filter(device => device.id !== id)
          return { paired, channels: channelsFrom(paired) }
        }),

      setDiscretion: mode => set({ discretion: mode }),
      setIntensity: value => set({ intensity: value }),
      setHelpLevel: level => set({ helpLevel: level }),
      setOutput: mode => set({ output: mode }),
      confirm: id =>
        set(state => ({ confirmations: { ...state.confirmations, [id]: true } })),

      setSession: (code, deviceId) =>
        set({ sessionCode: code, deviceId, devices: code ? get().devices : [] }),
      setDevices: devices => set({ devices }),
      setLastCue: cue => set({ lastCue: cue })
    }),
    {
      name: 'learning-state',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }
          : localStorage
      ),
      skipHydration: true,
      merge: (persisted, current) => {
        const next = { ...current, ...(persisted as Partial<AppState>) }
        return { ...next, channels: channelsFrom(next.paired) }
      },
      partialize: state => ({
        learning: state.learning,
        history: state.history,
        unseenLearning: state.unseenLearning,
        demo: state.demo,
        paired: state.paired,
        discretion: state.discretion,
        intensity: state.intensity,
        helpLevel: state.helpLevel,
        output: state.output,
        confirmations: state.confirmations,
        sessionCode: state.sessionCode
      })
    }
  )
)
