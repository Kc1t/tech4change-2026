import { useEffect, useRef, useState, type RefObject } from 'react'
import type { DemoCue } from '../demo/types'

const SPEAKING_MS = 900
const DEFAULT_WIDTH = 390

export function useCuePulse(cue: DemoCue) {
  const [count, setCount] = useState(0)
  const key = cue.phase === 'idle' ? null : `${cue.phase}-${cue.level}`

  useEffect(() => {
    if (key) setCount(value => value + 1)
  }, [key])

  return count
}

export function useSpeaking(heard: string) {
  const [speaking, setSpeaking] = useState(false)
  const seen = useRef(heard)

  useEffect(() => {
    if (heard === seen.current) return
    seen.current = heard
    if (!heard) {
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    const timer = window.setTimeout(() => setSpeaking(false), SPEAKING_MS)
    return () => window.clearTimeout(timer)
  }, [heard])

  return speaking
}

export function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return width
}
