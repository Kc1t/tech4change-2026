export type ActionTone = 'ear' | 'think' | 'voice' | 'buzz' | 'map'

export interface DemoAction {
  id: number
  label: string
  tone: ActionTone
}

export type Beat =
  | { at: number; kind: 'listen' }
  | { at: number; kind: 'heard'; text: string }
  | { at: number; kind: 'action'; label: string; tone: ActionTone }
  | { at: number; kind: 'cue' }
  | { at: number; kind: 'resolve' }
  | { at: number; kind: 'learn' }
  | { at: number; kind: 'end' }

export const DEMO_SCRIPT: Beat[] = [
  { at: 0, kind: 'listen' },
  { at: 900, kind: 'heard', text: 'Mãe, quem que vem no domingo?' },
  { at: 2900, kind: 'heard', text: 'É a minha… a minha…' },
  { at: 4400, kind: 'action', label: 'frase ouvida', tone: 'ear' },
  { at: 5400, kind: 'action', label: '4 no mapa', tone: 'think' },
  { at: 6400, kind: 'action', label: 'escolhi pela fala', tone: 'think' },
  { at: 7400, kind: 'action', label: 'falei em voz alta', tone: 'voice' },
  { at: 7450, kind: 'cue' },
  { at: 7950, kind: 'action', label: 'vibrou no pulso', tone: 'buzz' },

  { at: 11400, kind: 'heard', text: 'É a minha… a mi…' },
  { at: 12600, kind: 'action', label: 'ainda não veio', tone: 'ear' },
  { at: 13600, kind: 'action', label: 'subi um degrau', tone: 'voice' },
  { at: 13650, kind: 'cue' },
  { at: 14150, kind: 'action', label: 'vibrou no pulso', tone: 'buzz' },

  { at: 17600, kind: 'heard', text: 'a mi… a mi…' },
  { at: 18800, kind: 'action', label: 'travou na sílaba', tone: 'ear' },
  { at: 19800, kind: 'action', label: 'dei o começo dela', tone: 'voice' },
  { at: 19850, kind: 'cue' },
  { at: 20350, kind: 'action', label: 'vibrou no pulso', tone: 'buzz' },

  { at: 23600, kind: 'heard', text: 'Le… Letícia!' },
  { at: 24400, kind: 'action', label: 'ela disse a palavra', tone: 'map' },
  { at: 24450, kind: 'resolve' },
  { at: 26400, kind: 'action', label: 'mapa aprendeu', tone: 'map' },
  { at: 26450, kind: 'learn' },
  { at: 30500, kind: 'end' }
]

export const DEMO_DURATION = DEMO_SCRIPT[DEMO_SCRIPT.length - 1]!.at

export const TRAIL_CAP = 3
