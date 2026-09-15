import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import graphData from '@/data/graph.json'
import { deterministicPlan, buildLadder, startingLevel } from '@/domain/ladder'
import type {
  ChannelState,
  DiscretionMode,
  LadderStep,
  LearningState,
  LifeGraph,
  Mastery,
  NodeId,
  Scene
} from '@/domain/types'

export const lifeGraph = graphData as unknown as LifeGraph

export const SCENES: Scene[] = [
  {
    targetId: 'leticia',
    speaker: 'Rodrigo, filho',
    prompt: 'Mãe, quem que vem no domingo?',
    attempt: 'É a minha… a minha…'
  },
  {
    targetId: 'skimmer',
    speaker: 'Marina, filha',
    prompt: 'Mãe, o que a senhora tá procurando?',
    attempt: 'Aquela coisa de… de tirar…'
  },
  {
    targetId: 'ubatuba',
    speaker: 'Letícia, neta',
    prompt: 'Vó, onde a gente passava o ano novo?',
    attempt: 'Lá na… na praia de…'
  },
  {
    targetId: 'tupi',
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
  channels: ChannelState
  discretion: DiscretionMode
  intensity: number
  learning: Record<NodeId, LearningState>

  scene: () => Scene
  target: () => NodeId
  learningFor: (id: NodeId) => LearningState

  start: () => void
  advance: () => void
  succeed: () => number
  nextScene: () => void
  toggleChannel: (key: keyof ChannelState) => void
  setDiscretion: (mode: DiscretionMode) => void
  setIntensity: (value: number) => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      sceneIndex: 0,
      ladder: [],
      level: 0,
      open: false,
      channels: { phone: true, earbuds: true, watch: false },
      discretion: 'discreet',
      intensity: 3,
      learning: {},

      scene: () => SCENES[get().sceneIndex]!,
      target: () => SCENES[get().sceneIndex]!.targetId,
      learningFor: id => get().learning[id] ?? EMPTY_LEARNING,

      start: () => {
        const targetId = get().target()
        const ladder = buildLadder(lifeGraph, deterministicPlan(lifeGraph, targetId))
        const previous = get().learningFor(targetId).lastLevel
        set({ ladder, open: true, level: startingLevel(previous, ladder.length) })
      },

      advance: () => {
        const { level, ladder } = get()
        set({ level: Math.min(level + 1, ladder.length) })
      },

      succeed: () => {
        const targetId = get().target()
        const { level, ladder, learning } = get()
        const previous = learning[targetId] ?? EMPTY_LEARNING

        set({
          open: false,
          learning: {
            ...learning,
            [targetId]: {
              lastLevel: level,
              successes: previous.successes + 1,
              failures: previous.failures,
              lastSeen: new Date().toISOString(),
              nextReview: null,
              mastery: nextMastery(previous.mastery, level, ladder.length)
            }
          }
        })

        return level
      },

      nextScene: () =>
        set(state => ({
          sceneIndex: (state.sceneIndex + 1) % SCENES.length,
          ladder: [],
          level: 0,
          open: false
        })),

      toggleChannel: key =>
        set(state => ({ channels: { ...state.channels, [key]: !state.channels[key] } })),

      setDiscretion: mode => set({ discretion: mode }),
      setIntensity: value => set({ intensity: value })
    }),
    {
      name: 'learning-state',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        learning: state.learning,
        channels: state.channels,
        discretion: state.discretion,
        intensity: state.intensity
      })
    }
  )
)
