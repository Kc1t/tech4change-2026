'use client'

import { useEffect, useRef, useState } from 'react'
import { PITCH_ASSETS } from '../deck/assets'

function typingIn(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

export function DemoReserve() {
  const video = useRef<HTMLVideoElement>(null)
  const showing = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'KeyF' || event.ctrlKey || event.metaKey || event.altKey || event.repeat || typingIn(event.target)) return
      const element = video.current
      if (!element || (!showing.current && element.error)) return
      event.preventDefault()
      showing.current = !showing.current
      setVisible(showing.current)
      if (showing.current) {
        element.currentTime = 0
        void element.play().catch(() => {})
      } else {
        element.pause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <video
      ref={video}
      className={`abs demo-reserve${visible ? ' demo-reserve--on' : ''}`}
      src={`${PITCH_ASSETS}/demo-reserva.mp4`}
      preload="auto"
      playsInline
      onError={() => {
        showing.current = false
        setVisible(false)
      }}
      aria-hidden={!visible}
    />
  )
}
