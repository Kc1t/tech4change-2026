import { create } from 'zustand'
import graphData from '../data/graph.json'
import { buildLadder, deterministicPlan, resolve, startingLevel } from '../domain/ladder'
import type { HelpLevel, LadderStep, LifeGraph, OutputMode, Scene } from '../domain/types'

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

interface AppState {
  sceneIndex: number
  ladder: LadderStep[]
  level: number
  open: boolean
  helpLevel: HelpLevel
  output: OutputMode
  lastLevelByTarget: Record<string, number>
  scene: () => Scene
  start: () => void
  advance: () => void
  succeed: (levelUsed?: number) => number
  nextScene: () => void
  setHelpLevel: (level: HelpLevel) => void
  setOutput: (output: OutputMode) => void
}

export const useApp = create<AppState>()((set, get) => ({
  sceneIndex: 0,
  ladder: [],
  level: 0,
  open: false,
  helpLevel: 'hint',
  output: 'both',
  lastLevelByTarget: {},

  scene: () => SCENES[get().sceneIndex]!,

  start: () => {
    const state = get()
    const targetId = state.scene().targetId
    const plan = deterministicPlan(lifeGraph, targetId)
    const steps = resolve(lifeGraph, plan)
    const previous = state.lastLevelByTarget[targetId] ?? null
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
    set({
      open: false,
      lastLevelByTarget: { ...state.lastLevelByTarget, [targetId]: used }
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
  setOutput: output => set({ output })
}))

export { buildLadder }
