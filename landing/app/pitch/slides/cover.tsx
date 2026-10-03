import { useEffect, useState } from 'react'
import { PITCH_ASSETS } from '../deck/assets'
import type { StepProps } from '../deck/types'
import './cover.css'

const PEOPLE = [
  { id: 'helena', name: 'Dona Helena', age: 50, story: 'depois de um AVC', x: 46, y: 32 },
  { id: 'jorge', name: 'Seu Jorge', age: 72, story: 'teve um tumor cerebral', x: 48, y: 40 },
  { id: 'ana', name: 'Ana', age: 38, story: 'sofreu um acidente de carro', x: 60, y: 30 }
]

const BARS = [19, 40, 63, 85, 61, 33, 34]
const DOTS = [7, 6, 5, 5, 4]
const BREAK_MS = 1800
const ADVANCE_MS = 3600
const LINE_GAP_MS = 1300
const FIRST_LINE_MS = 300

function Words({ words, on, from = 0 }: { words: string[]; on: boolean; from?: number }) {
  return (
    <>
      {words.map((word, index) => (
        <span key={index} className={on ? 'word on' : 'word'} style={{ transitionDelay: `${(from + index) * 140}ms` }}>
          {word === 'param' ? <b>{word}</b> : word}{' '}
        </span>
      ))}
    </>
  )
}

function SpeechWave({ still }: { still: boolean }) {
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setBroken(true), BREAK_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const mode = still ? '' : broken ? ' broken' : ' talking'
  return (
    <div className={`abs speech-wave${mode}`}>
      {BARS.map((height, index) => <i key={`b${index}`} className="bar" style={{ left: index * 19, height }} />)}
      {DOTS.map((size, index) => <i key={`d${index}`} className="dot" style={{ left: 142 + index * 23, width: size, height: size, transitionDelay: `${index * 120}ms` }} />)}
    </div>
  )
}

function CoverLines({ revealed }: { revealed: boolean }) {
  const [lit, setLit] = useState(0)

  useEffect(() => {
    if (!revealed) return
    const timers = [1, 2, 3].map(count => window.setTimeout(() => setLit(count), (count - 1) * LINE_GAP_MS + FIRST_LINE_MS))
    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [revealed])

  return (
    <>
      <p className="abs hook serif">
        <Words words={['Nenhum', 'deles', 'esqueceu.']} on={lit >= 1} />
        <br />
        <Words words={['O', 'caminho', 'se', 'rompeu.']} on={lit >= 2} />
      </p>
      <p className="abs rupture serif">
        <Words words={['E,', 'aos', 'poucos,', 'eles']} on={lit >= 3} />
        <br />
        <Words words={['param', 'de', 'conversar.']} on={lit >= 3} from={4} />
      </p>
    </>
  )
}

export function Cover({ step, setStep }: StepProps) {
  const all = step >= 3

  useEffect(() => {
    if (step !== 2) return
    const timer = window.setTimeout(() => setStep(3), ADVANCE_MS)
    return () => window.clearTimeout(timer)
  }, [step, setStep])

  return (
    <div className="opening">
      <CoverLines key={all ? 'all' : 'one'} revealed={all} />
      <SpeechWave key={step} still={all} />
      <img className="abs cover-logo" src={`${PITCH_ASSETS}/eilo-logo-lilas2.png`} alt="eilo" />
      <div className={`abs people${all ? ' all' : ''}`}>
        {PEOPLE.map((person, index) => (
          <div key={person.id} className={`person${!all && index === step ? ' big' : ''}`}>
            <div className="photo" style={{ transformOrigin: `${person.x}% ${person.y + 6}%` }}>
              <div className="ken-burns" style={{ transformOrigin: `${person.x}% ${person.y}%` }}>
                <img src={`${PITCH_ASSETS}/${person.id}.webp`} alt={person.name} style={{ objectPosition: `${person.x}% ${person.y}%` }} />
              </div>
            </div>
            <div className="shade-bottom" />
            <div className="shade-left" />
            <div className="caption caption-big"><b>{person.name}</b><span>{person.age} anos · {person.story}</span></div>
            <div className="caption caption-small"><b>{person.name}</b><span>{person.age} anos · {person.story}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
