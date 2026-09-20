import type { ImageSourcePropType } from 'react-native'

export type WordKind = 'person' | 'place' | 'object' | 'event'

export const KIND_LABEL: Record<WordKind, string> = {
  person: 'pessoa',
  place: 'lugar',
  object: 'objeto',
  event: 'momento'
}

export interface PatientWord {
  label: string
  kind: WordKind
  value: number
  up: boolean
}

export interface Alert {
  kind: 'idle' | 'ready'
  problem: string
  action: string
}

export interface Patient {
  id: string
  name: string
  photo: ImageSourcePropType
  since: string
  note: string
  noteIsGain: boolean
  alert?: Alert
  trend: number[]
  trendWithout: number[]
  words: PatientWord[]
  withHaptics: number
  withoutHaptics: number
  sessionsWithHaptics: number
  sessionsWithoutHaptics: number
}

export const PATIENTS: Patient[] = [
  {
    id: 'helena',
    name: 'Helena',
    photo: require('../../assets/patients/helena.png'),
    since: 'há 8 semanas',
    note: 'caiu 1,8 em 8 semanas',
    noteIsGain: true,
    trend: [3.6, 3.4, 3.1, 2.9, 2.5, 2.3, 2.0, 1.8],
    trendWithout: [4.1, 4.0, 3.8, 3.7, 3.4, 3.3, 3.1, 3.0],
    words: [
      { label: 'Escumadeira', kind: 'object', value: 2.8, up: true },
      { label: 'Letícia', kind: 'person', value: 2.1, up: false },
      { label: 'Ubatuba', kind: 'place', value: 1.2, up: false }
    ],
    withHaptics: 1.8,
    withoutHaptics: 3.0,
    sessionsWithHaptics: 34,
    sessionsWithoutHaptics: 12
  },
  {
    id: 'anibal',
    name: 'Aníbal',
    photo: require('../../assets/patients/anibal.png'),
    since: 'há 5 semanas',
    note: 'há 5 semanas',
    noteIsGain: false,
    alert: { kind: 'idle', problem: '5 dias sem usar', action: 'Avisar família' },
    trend: [3.9, 3.6, 3.3, 2.8, 3.0],
    trendWithout: [4.4, 4.2, 4.0, 3.5, 3.6],
    words: [
      { label: 'Bicicleta', kind: 'object', value: 3.2, up: true },
      { label: 'Vizinho', kind: 'person', value: 2.4, up: false },
      { label: 'Padaria', kind: 'place', value: 2.0, up: false }
    ],
    withHaptics: 3.0,
    withoutHaptics: 3.7,
    sessionsWithHaptics: 19,
    sessionsWithoutHaptics: 15
  },
  {
    id: 'sonia',
    name: 'Sônia',
    photo: require('../../assets/patients/sonia.png'),
    since: 'há 12 semanas',
    note: 'há 12 semanas',
    noteIsGain: false,
    alert: { kind: 'ready', problem: 'Pronta para menos ajuda', action: 'Tirar pista sonora' },
    trend: [3.4, 3.0, 2.6, 2.2, 1.9, 1.6, 1.4, 1.3],
    trendWithout: [3.8, 3.6, 3.3, 3.1, 2.9, 2.8, 2.7, 2.6],
    words: [
      { label: 'Domingo', kind: 'event', value: 2.0, up: false },
      { label: 'Farmácia', kind: 'place', value: 1.4, up: false },
      { label: 'Neto', kind: 'person', value: 1.1, up: false }
    ],
    withHaptics: 1.3,
    withoutHaptics: 2.6,
    sessionsWithHaptics: 58,
    sessionsWithoutHaptics: 9
  },
  {
    id: 'rubens',
    name: 'Rubens',
    photo: require('../../assets/patients/rubens.png'),
    since: 'há 2 semanas',
    note: 'linha de base: semana 2 de 4',
    noteIsGain: false,
    trend: [4.0, 3.9],
    trendWithout: [4.2, 4.1],
    words: [{ label: 'Chave', kind: 'object', value: 3.8, up: true }],
    withHaptics: 3.9,
    withoutHaptics: 4.0,
    sessionsWithHaptics: 6,
    sessionsWithoutHaptics: 4
  }
]

export function latest(patient: Patient): number {
  return patient.trend[patient.trend.length - 1]!
}

export function drop(patient: Patient): number {
  return patient.trend[0]! - latest(patient)
}

export function gain(patient: Patient): number {
  return patient.withoutHaptics - patient.withHaptics
}

export const CLINIC = {
  active: 3,
  total: PATIENTS.length,
  beforeSound: 41,
  beforeSoundGain: 6
}

export function attention(): Patient[] {
  return PATIENTS.filter(patient => patient.alert !== undefined)
}

export function onPlan(): Patient[] {
  return PATIENTS.filter(patient => patient.alert === undefined)
}

export function caseloadAverage(): number {
  return PATIENTS.reduce((sum, patient) => sum + latest(patient), 0) / PATIENTS.length
}
