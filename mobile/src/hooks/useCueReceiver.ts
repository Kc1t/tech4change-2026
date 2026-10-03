import { useEffect } from 'react'
import { speakVoice } from '../voice'
import { buzzTargets } from '../domain/devices'
import { patternFor, pulse } from '../haptics'
import { lifeGraph, useApp } from '../store'

const HOLD_MS = 6000

export function useCueReceiver() {
  const lastCue = useApp(s => s.lastCue)
  const setLastCue = useApp(s => s.setLastCue)

  useEffect(() => {
    if (!lastCue) return

    const { paired, intensity, output } = useApp.getState()
    const resolved = lastCue.event === 'resolved'
    const pattern = resolved ? 'success' : patternFor(lastCue.level, lastCue.isFinal)
    const buzzes = buzzTargets(paired).some(device => device.buzz)
    const stop = buzzes ? pulse(pattern, intensity) : undefined

    if (output !== 'text' && !resolved) {
      const node = lifeGraph.nodes[lastCue.targetId]
      const spoken = lastCue.isFinal
        ? (node?.phon?.firstSyllable ?? null)
        : (node?.attrs[lastCue.attr] ?? null)
      if (spoken) speakVoice(spoken, () => undefined)
    }

    const timer = setTimeout(() => setLastCue(null), HOLD_MS)

    return () => {
      stop?.()
      clearTimeout(timer)
    }
  }, [lastCue, setLastCue])

  return lastCue
}
