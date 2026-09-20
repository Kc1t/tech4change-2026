import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Text } from 'react-native'

const CHAR_MS = 34

export function useReducedMotion(): boolean {
  const [still, setStill] = useState(false)

  useEffect(() => {
    let alive = true
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (alive) setStill(value)
    })
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setStill)
    return () => {
      alive = false
      listener.remove()
    }
  }, [])

  return still
}

export function Typed({
  text,
  className,
  speed = CHAR_MS
}: {
  text: string
  className?: string
  speed?: number
}) {
  const still = useReducedMotion()
  const [shown, setShown] = useState(text)
  const previous = useRef(text)

  useEffect(() => {
    if (still || text === previous.current) {
      previous.current = text
      setShown(text)
      return
    }

    previous.current = text
    let index = 0
    setShown('')

    const timer = setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length) clearInterval(timer)
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, still])

  return (
    <Text className={className} accessibilityLabel={text}>
      {shown}
    </Text>
  )
}
