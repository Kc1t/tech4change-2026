import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEMO_SCRIPT,
  TRAIL_CAP,
  type Beat,
  type DemoAction
} from '../domain/demoFlow'

export interface DemoState {
  running: boolean
  heard: string
  actions: DemoAction[]
}

const IDLE: DemoState = { running: false, heard: '', actions: [] }

export interface DemoHandlers {
  onCue: () => void
  onResolve: () => void
  onLearn: () => void
}

export function useDemoFlow(handlers: DemoHandlers) {
  const [state, setState] = useState<DemoState>(IDLE)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])
  const counter = useRef(0)

  const bound = useRef(handlers)
  bound.current = handlers

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const stop = useCallback(() => {
    clear()
    setState(IDLE)
  }, [clear])

  const apply = useCallback((beat: Beat) => {
    switch (beat.kind) {
      case 'listen':
        setState({ running: true, heard: '', actions: [] })
        return
      case 'heard':
        setState(previous => ({ ...previous, heard: beat.text }))
        return
      case 'action':
        counter.current += 1
        setState(previous => ({
          ...previous,
          actions: [
            ...previous.actions,
            { id: counter.current, label: beat.label, tone: beat.tone }
          ].slice(-TRAIL_CAP)
        }))
        return
      case 'cue':
        bound.current.onCue()
        return
      case 'resolve':
        bound.current.onResolve()
        return
      case 'learn':
        bound.current.onLearn()
        return
      case 'end':
        setState(previous => ({ ...previous, running: false, heard: '' }))
        return
    }
  }, [])

  const start = useCallback(() => {
    clear()
    counter.current = 0
    setState({ running: true, heard: '', actions: [] })

    timers.current = DEMO_SCRIPT.map(beat =>
      setTimeout(() => apply(beat), beat.at)
    )
  }, [apply, clear])

  useEffect(() => clear, [clear])

  return { demo: state, start, stop }
}
