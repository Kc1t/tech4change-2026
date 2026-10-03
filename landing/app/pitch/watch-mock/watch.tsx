'use client'

import { useEffect, useRef, useState } from 'react'
import { PITCH_ASSETS } from '../deck/assets'
import type { DemoCue } from '../demo/types'
import { ShakeTrail, type Mark } from './shake-trail'
import { WatchAurora, type Surge } from './watch-aurora'
import { WatchBands } from './watch-bands'
import './watch.css'

function RungMarks({ count, stretched }: { count: number; stretched: boolean }) {
  if (count === 0) return <div className="wm-marks" />
  return (
    <div className="wm-marks">
      {Array.from({ length: count }, (_, n) => <i key={n} className={stretched ? 'wm-dash' : undefined} />)}
    </div>
  )
}

function glowFor(level: number, isFinal: boolean) {
  if (isFinal) return 1
  if (level >= 3) return 0.88
  if (level === 2) return 0.68
  return 0.46
}

const SHAKE: Keyframe[] = [
  { translate: '0 0', rotate: '0deg' },
  { translate: '-4px 0', rotate: '-1.2deg', offset: 0.15 },
  { translate: '4px 0', rotate: '1.2deg', offset: 0.3 },
  { translate: '-3px 0', rotate: '-0.7deg', offset: 0.45 },
  { translate: '3px 0', rotate: '0.7deg', offset: 0.6 },
  { translate: '-1px 0', rotate: '0deg', offset: 0.8 },
  { translate: '0 0', rotate: '0deg' }
]

export function WatchMock({ cue, buzzing, time }: { cue: DemoCue; buzzing: boolean; time: string }) {
  const device = useRef<HTMLDivElement>(null)
  const seq = useRef(0)
  const [marks, setMarks] = useState<Mark[]>([])
  const [surge, setSurge] = useState<Surge>({ to: 0, at: 0 })

  const word = cue.phase === 'given' || cue.phase === 'success'
  const isFinal = cue.kind === 'phonological'
  const rung = cue.level + 1
  const key = `${cue.phase}-${cue.level}`

  useEffect(() => {
    if (cue.phase === 'idle') {
      setMarks([])
      return
    }
    const id = ++seq.current
    setMarks(current => [...current, { id, level: rung, isFinal: word || isFinal }].slice(-3))
    setSurge({ to: word ? 1 : glowFor(rung, isFinal), at: performance.now() })
  }, [key, cue.phase, rung, word, isFinal])

  useEffect(() => {
    if (!buzzing) return
    device.current?.animate(SHAKE, { duration: 480, easing: 'ease-in-out' })
  }, [buzzing, key])

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
                <RungMarks count={cue.phase === 'cue' ? (isFinal ? 1 : Math.min(rung, 3)) : 0} stretched={isFinal} />
                <p className={`wm-cue${cue.phase === 'idle' ? ' wm-cue--idle' : ''}${word ? ' wm-cue--word' : ''}`}>
                  {cue.phase === 'idle' ? 'Aguardando fala' : cue.text}
                </p>
                <ShakeTrail marks={marks} />
              </div>
            </div>
            <div className="wm-glass" />
          </div>
        </div>
      </div>
      <div className="wm-caption">o que ela sente no pulso</div>
    </div>
  )
}
