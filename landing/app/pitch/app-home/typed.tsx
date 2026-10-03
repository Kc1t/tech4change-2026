import { useEffect, useRef, useState } from 'react'

const CHAR_MS = 34

export function Typed({ text, className }: { text: string; className: string }) {
  const [shown, setShown] = useState(text)
  const previous = useRef(text)

  useEffect(() => {
    if (text === previous.current) return
    previous.current = text
    let index = 0
    setShown('')
    const timer = window.setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, CHAR_MS)
    return () => window.clearInterval(timer)
  }, [text])

  return (
    <p className={className} aria-label={text}>
      {shown}
    </p>
  )
}
