import { create } from 'zustand'
import graphData from '../data/graph.json'
import { demoHistory } from '../domain/demo'
import { BUILT_IN_DEVICES, channelsFrom, DISCOVERABLE, type PairedDevice } from '../domain/devices'
import type { CuePayload, Device } from '../sync/client'
import { buildLadder, deterministicPlan, resolve, startingLevel } from '../domain/ladder'
import type {
  ChannelState,
  HelpLevel,
  LadderStep,
  LearningState,
  LifeGraph,
  Mastery,
  NodeId,
  OutputMode,
  Backdrop,
  Resolution,
  Scene
} from '../domain/types'

export let lifeGraph = graphData as unknown as LifeGraph

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

export let seeded = false

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

const HISTORY_CAP = 240

function nextMastery(current: Mastery, levelsUsed: number, total: number): Mastery {
  if (levelsUsed <= 1) return 'high'
  if (levelsUsed <= Math.ceil(total / 2)) return 'medium'
  return current === 'unseen' ? 'low' : current
}

interface AppState {
  sceneIndex: number
  ladder: LadderStep[]
  level: number
  open: boolean
  helpLevel: HelpLevel
  output: OutputMode
  backdrop: Backdrop
  channels: ChannelState
  paired: PairedDevice[]
  sessionCode: string | null
  deviceId: string | null
  devices: Device[]
  intensity: number
  lastCue: CuePayload | null
  learning: Record<NodeId, LearningState>
  history: Resolution[]
  unseenLearning: NodeId[]
  memoryFilter: NodeId | null
  demo: boolean
  demoRequest: number

  scene: () => Scene
  learningFor: (id: NodeId) => LearningState
  start: () => void
  advance: () => void
  succeed: (levelUsed?: number) => number
  nextScene: () => void
  setHelpLevel: (level: HelpLevel) => void
  setOutput: (output: OutputMode) => void
  setBackdrop: (backdrop: Backdrop) => void
  setIntensity: (value: number) => void
  toggleDevice: (id: string) => void
  toggleBuzz: (id: string) => void
  pairDevice: (id: string) => void
  unpairDevice: (id: string) => void
  setSession: (code: string | null, deviceId: string | null) => void
  setDevices: (devices: Device[]) => void
  setLastCue: (cue: CuePayload | null) => void
  setMemoryFilter: (id: NodeId | null) => void
  markLearningSeen: () => void
  fireDemo: () => void
  loadDemo: () => void
  clearDemo: () => void
}

export const useApp = create<AppState>()((set, get) => ({
  sceneIndex: 0,
  ladder: [],
  level: 0,
  open: false,
  helpLevel: 'hint',
  output: 'both',
  backdrop: 'wave',
  channels: channelsFrom(BUILT_IN_DEVICES),
  paired: BUILT_IN_DEVICES,
  sessionCode: null,
  deviceId: null,
  devices: [],
  intensity: 3,
  lastCue: null,
  learning: {},
  history: [],
  unseenLearning: [],
  memoryFilter: null,
  demo: false,
  demoRequest: 0,

  scene: () => SCENES[get().sceneIndex]!,
  learningFor: id => get().learning[id] ?? EMPTY_LEARNING,

  start: () => {
    const state = get()
    const targetId = state.scene().targetId
    const plan = deterministicPlan(lifeGraph, targetId)
    const steps = resolve(lifeGraph, plan)
    const previous = state.learningFor(targetId).lastLevel

    set({
      ladder: steps,
      open: true,
      level: startingLevel(previous, steps.length)
    })
  },

  advance: () => {
    const { level, ladder } = get()
    set({ level: Math.min(level + 1, ladder.length) })
  },

  succeed: levelUsed => {
    const state = get()
    const used = levelUsed ?? state.level
    const targetId = state.scene().targetId
    const previous = state.learning[targetId] ?? EMPTY_LEARNING
    const isNew = state.learning[targetId] === undefined
    const at = new Date().toISOString()
    const rungs = state.ladder.length || 4

    set({
      open: false,
      history: [...state.history, { at, targetId, level: used, rungs }].slice(-HISTORY_CAP),
      unseenLearning:
        isNew && !state.unseenLearning.includes(targetId)
          ? [...state.unseenLearning, targetId]
          : state.unseenLearning,
      learning: {
        ...state.learning,
        [targetId]: {
          lastLevel: used,
          successes: previous.successes + 1,
          failures: previous.failures,
          lastSeen: at,
          nextReview: null,
          mastery: nextMastery(previous.mastery, used, rungs)
        }
      }
    })

    return used
  },

  nextScene: () => {
    const state = get()
    set({
      sceneIndex: (state.sceneIndex + 1) % SCENES.length,
      ladder: [],
      level: 0,
      open: false
    })
  },

  setHelpLevel: helpLevel => set({ helpLevel }),
  setOutput: output => set({ output }),
  setBackdrop: backdrop => set({ backdrop }),
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
  setSession: (sessionCode, deviceId) =>
    set(state => ({ sessionCode, deviceId, devices: sessionCode ? state.devices : [] })),
  setDevices: devices => set({ devices }),
  setIntensity: (value: number) => set({ intensity: Math.min(5, Math.max(1, Math.round(value))) }),

  setLastCue: lastCue => set({ lastCue }),

  setMemoryFilter: id => set({ memoryFilter: id }),
  markLearningSeen: () => set({ unseenLearning: [] }),

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

  fireDemo: () => set(state => ({ demoRequest: state.demoRequest + 1 })),

  clearDemo: () => set({ history: [], learning: {}, unseenLearning: [], demo: false })
}))

export { buildLadder }
