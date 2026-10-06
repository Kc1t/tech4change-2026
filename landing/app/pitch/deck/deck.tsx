'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PITCH_ASSETS } from './assets'
import './deck.css'
import { DeckTimer } from './deck-timer'
import { SectionChip } from './section-chip'
import { SlideMenu } from './slide-menu'
import { SLIDES } from './slides'
import { useDeckLink } from './use-deck-link'

const STAGE = { width: 1920, height: 1080 }
const NEXT_KEYS = ['ArrowRight', 'PageDown']
const PREVIOUS_KEYS = ['ArrowLeft', 'PageUp']
const SLIDE_KEY = 'eilo-pitch-slide'

function clampSlide(index: number): number {
  return Math.max(0, Math.min(SLIDES.length - 1, index))
}

function useStageScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE.width, window.innerHeight / STAGE.height))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

export function Deck() {
  const [position, setPosition] = useState({ index: 0, step: 0 })
  const [menuOpen, setMenuOpen] = useState(false)
  const scale = useStageScale()

  const go = useCallback((index: number) => setPosition({ index: clampSlide(index), step: 0 }), [])
  const setStep = useCallback((step: number) => setPosition(current => ({ ...current, step })), [])

  const next = useCallback(() => setPosition(({ index, step }) => {
    const steps = SLIDES[index].steps ?? 1
    return step < steps - 1 ? { index, step: step + 1 } : { index: clampSlide(index + 1), step: 0 }
  }), [])

  const previous = useCallback(() => setPosition(({ index, step }) => (step > 0 ? { index, step: step - 1 } : { index: clampSlide(index - 1), step: 0 })), [])

  useEffect(() => {
    try {
      const saved = Number(window.sessionStorage.getItem(SLIDE_KEY))
      if (Number.isInteger(saved) && saved > 0) go(saved)
    } catch {}
  }, [go])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SLIDE_KEY, String(position.index))
    } catch {}
  }, [position.index])

  const actions = useMemo(() => ({ next, previous, go }), [next, previous, go])
  const remote = useDeckLink(position.index, actions)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (NEXT_KEYS.includes(event.key)) {
        event.preventDefault()
        if (!event.repeat) next()
      } else if (PREVIOUS_KEYS.includes(event.key)) {
        if (!event.repeat) previous()
      } else if (event.code === 'KeyM') setMenuOpen(open => !open)
      else if (event.code === 'KeyR') go(0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, previous, go])

  const slide = SLIDES[position.index]

  return (
    <div className="pitch">
      <div className="stage" style={{ transform: `scale(${scale}) translate(-50%, -50%)` }}>
        <DeckTimer moved={position.index > 0 || position.step > 0} />
        <div className="panel">
          {!slide.bare && slide.label && <SectionChip label={slide.label} />}
          {!slide.bare && <img className="logo" src={`${PITCH_ASSETS}/eilo-wordmark-lilas2.png`} alt="eilo" />}
          <div key={position.index} style={{ position: 'absolute', inset: 0 }}>{slide.render({ step: position.step, setStep, index: position.index, total: SLIDES.length })}</div>
        </div>
      </div>
      <SlideMenu slides={SLIDES} current={position.index} open={menuOpen} go={go} remote={remote} />
    </div>
  )
}
