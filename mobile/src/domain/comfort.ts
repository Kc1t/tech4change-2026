import AsyncStorage from '@react-native-async-storage/async-storage'
import type { OutputMode } from './types'

export type VoiceChoice = 'clara' | 'lia' | 'davi' | 'tomas'
export type Patience = 'calm' | 'middle' | 'quick'

export const VOICES: Array<{ id: VoiceChoice; name: string; description: string }> = [
  { id: 'clara', name: 'Clara', description: 'calma e acolhedora' },
  { id: 'lia', name: 'Lia', description: 'leve e carinhosa' },
  { id: 'davi', name: 'Davi', description: 'grave e tranquilo' },
  { id: 'tomas', name: 'Tomás', description: 'maduro e paciente' }
]

export const PATIENCE: Array<{ value: Patience; label: string; hint: string; silenceMs: number }> = [
  { value: 'calm', label: 'Com calma', hint: 'Espero uns três segundos antes de oferecer uma pista.', silenceMs: 3000 },
  { value: 'middle', label: 'No meio', hint: 'Espero uns dois segundos antes de oferecer uma pista.', silenceMs: 2000 },
  { value: 'quick', label: 'Logo', hint: 'Ofereço a pista na primeira pausa.', silenceMs: 1300 }
]

export interface Comfort {
  voice: VoiceChoice
  patience: Patience
  output: OutputMode
}

export const DEFAULT_COMFORT: Comfort = { voice: 'clara', patience: 'middle', output: 'both' }

const COMFORT_KEY = 'comfort'

export function silenceFor(patience: Patience): number {
  return PATIENCE.find(option => option.value === patience)!.silenceMs
}

export function voiceIntro(owner: string | undefined): string {
  const greeting = owner ? `Oi, ${owner}.` : 'Oi.'
  return `${greeting} Quando uma palavra sumir, eu te dou uma pista. Sem pressa.`
}

export async function readComfort(): Promise<Comfort> {
  const raw = await AsyncStorage.getItem(COMFORT_KEY).catch(() => null)
  if (!raw) return DEFAULT_COMFORT
  try {
    return { ...DEFAULT_COMFORT, ...(JSON.parse(raw) as Partial<Comfort>) }
  } catch {
    return DEFAULT_COMFORT
  }
}

export function saveComfort(comfort: Comfort) {
  void AsyncStorage.setItem(COMFORT_KEY, JSON.stringify(comfort)).catch(() => undefined)
}
