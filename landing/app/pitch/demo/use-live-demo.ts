'use client'

import { useEffect, useRef, useState } from 'react'
import type { Voice } from '../eilo/voice'
import { DemoEngine } from './engine'
import { INITIAL_STATE, type DemoCue, type LiveDemoState } from './types'

export type LiveDemoOptions = { voice?: Voice | null; listen?: boolean; wakeWord?: boolean }

export function useLiveDemo(active: boolean, onCue: (cue: DemoCue) => void, options: LiveDemoOptions = {}) {
  const [state, setState] = useState<LiveDemoState>(INITIAL_STATE)
  const onCueRef = useRef(onCue)
  const [engine] = useState(() => new DemoEngine({ onState: setState, onCue: cue => onCueRef.current(cue) }, { listen: options.listen ?? true, wakeWord: options.wakeWord ?? false }))
  const voice = options.voice ?? null

  useEffect(() => {
    onCueRef.current = onCue
  }, [onCue])

  useEffect(() => {
    engine.setVoice(voice)
  }, [engine, voice])

  useEffect(() => {
    if (!active) return
    engine.start()
    return () => engine.stop()
  }, [active, engine])

  return { state, nextLevel: engine.nextLevel, giveWord: engine.giveWord, wake: engine.wake, reset: engine.reset, simulate: engine.simulate, micLevel: engine.micLevel }
}
