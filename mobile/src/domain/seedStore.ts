import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseSeed, type Seed } from './seed'

const STORAGE_KEY = 'seed-answers'

export async function readSeed(): Promise<Seed | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return parseSeed(JSON.parse(stored) as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function saveSeed(seed: Seed): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  } catch {
    void 0
  }
}

export async function forgetSeed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch {
    void 0
  }
}
