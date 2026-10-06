'use client'

import { useEffect, useRef, useState } from 'react'
import { PITCH_ASSETS } from '../deck/assets'

type Reel = 'quick' | 'full'

const REEL_FILE: Record<Reel, string> = {
  quick: 'demo-reserva-narrar.mp4',
  full: 'demo-reserva.mp4'
}

const REEL_LABEL: Record<Reel, { title: string; close: string }> = {
  quick: { title: 'vídeo gravado · Helena e a neta', close: 'F volta ao vivo' },
  full: { title: 'vídeo gravado · a cena da chave', close: 'Shift+F volta ao vivo' }
}

function typingIn(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

export function DemoReserve() {
  const videos = useRef<Record<Reel, HTMLVideoElement | null>>({ quick: null, full: null })
  const showing = useRef<Reel | null>(null)
  const [visible, setVisible] = useState<Reel | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const show = (reel: Reel | null) => {
      for (const element of Object.values(videos.current)) element?.pause()
      showing.current = reel
      setVisible(reel)
      const element = reel ? videos.current[reel] : null
      if (!element) return
      element.currentTime = 0
      void element.play().catch(() => {})
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || typingIn(event.target)) return
      if (event.code === 'KeyF') {
        const reel: Reel = event.shiftKey ? 'full' : 'quick'
        if (showing.current !== reel && videos.current[reel]?.error) return
        event.preventDefault()
        show(showing.current === reel ? null : reel)
      } else if ((event.code === 'Space' || event.code === 'KeyK' || event.code === 'KeyP') && showing.current) {
        const element = videos.current[showing.current]
        if (!element) return
        event.preventDefault()
        if (element.paused) void element.play().catch(() => {})
        else element.pause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {(Object.keys(REEL_FILE) as Reel[]).map(reel => (
        <video
          key={reel}
          ref={element => {
            videos.current[reel] = element
          }}
          className={`abs demo-reserve${visible === reel ? ' demo-reserve--on' : ''}`}
          src={`${PITCH_ASSETS}/${REEL_FILE[reel]}`}
          preload="auto"
          playsInline
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(!videos.current[reel]?.ended)}
          onError={() => {
            if (showing.current !== reel) return
            showing.current = null
            setVisible(null)
          }}
          aria-hidden={visible !== reel}
        />
      ))}
      {visible && (
        <>
          <span className={`abs demo-reserve-status status status--${paused ? 'held' : 'reel'}`}>{paused ? 'vídeo pausado' : REEL_LABEL[visible].title}</span>
          <div className="abs demo-reserve-bar">
            <span>{paused ? 'espaço continua' : 'espaço pausa'}</span>
            <span>{REEL_LABEL[visible].close}</span>
          </div>
        </>
      )}
    </>
  )
}
