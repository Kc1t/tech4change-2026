import { create } from 'zustand'
import graphData from '../data/graph.json'
import { demoHistory } from '../domain/demo'
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
  Resolution,
  Scene
} from '../domain/types'

export const lifeGraph = graphData as unknown as LifeGraph

export const SCENES: Scene[] = [
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
  channels: ChannelState
  learning: Record<NodeId, LearningState>
  history: Resolution[]
  unseenLearning: NodeId[]
  memoryFilter: NodeId | null
  demo: boolean

  scene: () => Scene
  learningFor: (id: NodeId) => LearningState
  start: () => void
  advance: () => void
  succeed: (levelUsed?: number) => number
  nextScene: () => void
  setHelpLevel: (level: HelpLevel) => void
  setOutput: (output: OutputMode) => void
  toggleChannel: (key: keyof ChannelState) => void
  setMemoryFilter: (id: NodeId | null) => void
  markLearningSeen: () => void
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
  channels: { phone: true, earbuds: true, watch: false },
  learning: {},
  history: [],
  unseenLearning: [],
  memoryFilter: null,
  demo: false,

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
  toggleChannel: key =>
    set(state => ({ channels: { ...state.channels, [key]: !state.channels[key] } })),
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

  clearDemo: () => set({ history: [], learning: {}, unseenLearning: [], demo: false })
}))

export { buildLadder }
