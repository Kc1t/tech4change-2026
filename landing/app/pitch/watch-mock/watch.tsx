'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PITCH_ASSETS } from '../deck/assets'
import type { DemoCue } from '../demo/types'
import { fold } from '../eilo/text-safety'
import { vibrationPattern } from '../sync'
import { buzzOf } from './buzz'
import { ShakeTrail, type Mark } from './shake-trail'
import { WatchAurora, type Surge } from './watch-aurora'
import { WatchBands } from './watch-bands'
import './watch.css'

function Pulses({ starts }: { starts: number[] }) {
  return (
    <div className="wm-marks">
      {starts.map((at, n) => <i key={n} style={{ animationDelay: `${at}ms` }} />)}
    </div>
  )
}

function syllableOf(text: string): string {
  return text.replace(/…|\.{3}/g, '').trim()
}

function Word({ word, syllable }: { word: string; syllable: string }) {
  const shown = word.charAt(0).toUpperCase() + word.slice(1)
  const known = syllable && fold(shown).startsWith(fold(syllable)) ? shown.slice(0, syllable.length) : ''
  return (
    <p className="wm-cue wm-cue--word">
      {known && <b className="wm-known">{known}</b>}
      <span className={known ? 'wm-rest' : undefined}>{shown.slice(known.length)}</span>
    </p>
  )
}

function Face({ cue, syllable }: { cue: DemoCue; syllable: string }) {
  if (cue.phase === 'idle') return <p className="wm-cue wm-cue--idle">Aguardando fala</p>
  if (cue.phase === 'given' || cue.phase === 'success') return <Word word={cue.text} syllable={syllable} />
  if (cue.kind === 'phonological') return <p className="wm-cue wm-cue--sound">{cue.text}</p>
  return <p className="wm-cue wm-cue--hint">pista {cue.level + 1}</p>
}

function glowFor(level: number, isFinal: boolean) {
  if (isFinal) return 1
  if (level >= 3) return 0.88
  if (level === 2) return 0.68
  return 0.46
}

export function WatchMock({ cue, buzzing, time }: { cue: DemoCue; buzzing: boolean; time: string }) {
  const device = useRef<HTMLDivElement>(null)
  const seq = useRef(0)
  const [marks, setMarks] = useState<Mark[]>([])
  const [surge, setSurge] = useState<Surge>({ to: 0, at: 0 })
  const [syllable, setSyllable] = useState('')

  const word = cue.phase === 'given' || cue.phase === 'success'
  const isFinal = cue.kind === 'phonological'
  const rung = cue.level + 1
  const key = `${cue.phase}-${cue.level}`
  const { phase, level } = cue
  const buzz = useMemo(() => buzzOf(vibrationPattern({ phase, level })), [phase, level])

  useEffect(() => {
    if (cue.phase === 'idle') {
      setMarks([])
      setSyllable('')
      return
    }
    if (cue.phase === 'cue' && isFinal) setSyllable(syllableOf(cue.text))
    const id = ++seq.current
    setMarks(current => [...current, { id, level: rung, isFinal: word || isFinal }].slice(-3))
    setSurge({ to: word ? 1 : glowFor(rung, isFinal), at: performance.now() })
  }, [key, cue.phase, cue.text, rung, word, isFinal])

  useEffect(() => {
    if (!buzzing || buzz.duration === 0) return
    device.current?.animate(buzz.keyframes, { duration: buzz.duration })
  }, [buzzing, key, buzz])

  return (
    <div className={`wm${buzzing ? ' wm--buzz' : ''}`}>
      <div className="wm-shadow" />
      <div key={key} className="wm-ripple"><i /><i /><i /></div>
      <div ref={device} className="wm-device">
        <WatchBands />
        <div className="wm-crown" />
        <div className="wm-button" />
        <div className="wm-case">
          <div className="wm-bezel">
            <div className="wm-screen">
              <WatchAurora surge={surge} />
              <span className="wm-time">{time}</span>
              <div key={key} className="wm-stage">
                {cue.phase === 'idle' && <img className="wm-mark" src={`${PITCH_ASSETS}/buddy.png`} alt="" />}
                <Pulses starts={buzz.pulses} />
                <Face cue={cue} syllable={syllable} />
                <ShakeTrail marks={marks} />
              </div>
            </div>
            <div className="wm-glass" />
          </div>
        </div>
      </div>
      <div className="wm-caption">o que se sente no pulso</div>
    </div>
  )
}
