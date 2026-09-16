import { useEffect, useRef, useState } from 'react'

export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    function measure() {
      frame = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0)
        return
      }
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)))
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return [ref, progress] as const
}

export function useScrollOffset() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let frame = 0

    function measure() {
      frame = 0
      setOffset(window.scrollY)
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
    }
  }, [])

  return offset
}
