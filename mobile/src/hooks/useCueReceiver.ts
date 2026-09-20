import { useEffect } from 'react'
import * as Speech from 'expo-speech'
import { buzzTargets } from '../domain/devices'
import { patternFor, pulse } from '../haptics'
import { lifeGraph, useApp } from '../store'

const HOLD_MS = 6000

export function useCueReceiver() {
  const lastCue = useApp(s => s.lastCue)
  const paired = useApp(s => s.paired)
  const intensity = useApp(s => s.intensity)
  const output = useApp(s => s.output)
  const setLastCue = useApp(s => s.setLastCue)

  useEffect(() => {
    if (!lastCue) return

    const buzzes = buzzTargets(paired).some(device => device.buzz)
    const stop = buzzes ? pulse(patternFor(lastCue.level, lastCue.isFinal), intensity) : undefined

    if (output !== 'text') {
      const node = lifeGraph.nodes[lastCue.targetId]
      const spoken = lastCue.isFinal
        ? (node?.phon?.firstSyllable ?? null)
        : (node?.attrs[lastCue.attr] ?? null)
      if (spoken) Speech.speak(spoken.replace('…', ''), { language: 'pt-BR' })
    }

    const timer = setTimeout(() => setLastCue(null), HOLD_MS)

    return () => {
      stop?.()
      clearTimeout(timer)
    }
  }, [lastCue, paired, intensity, output, setLastCue])

  return lastCue
}
