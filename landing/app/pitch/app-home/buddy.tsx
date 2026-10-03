'use client'

import { useEffect, useId, useRef, useState } from 'react'

export type BuddyMood = 'asleep' | 'listening' | 'speaking' | 'cue' | 'happy'

const AURORA_1 = '#b9a3f7'
const AURORA_2 = '#efb6ec'
const AURORA_3 = '#a9dcff'
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

function Sphere({ size, id }: { size: number; id: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="ah-buddy__sphere">
      <defs>
        <radialGradient id={`${id}-core`} cx="44%" cy="42%" r="60%">
          <stop offset="0" stopColor="#8b7bee" />
          <stop offset="0.45" stopColor="#9d8cf3" />
          <stop offset="0.82" stopColor={AURORA_1} />
        </radialGradient>
        <radialGradient id={`${id}-sky`} cx="50%" cy="106%" r="46%">
          <stop offset="0" stopColor={AURORA_3} stopOpacity="1" />
          <stop offset="1" stopColor={AURORA_3} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-haze`} cx="74%" cy="30%" r="40%">
          <stop offset="0" stopColor={AURORA_2} stopOpacity="0.7" />
          <stop offset="1" stopColor={AURORA_2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="0.58" stopColor="#ffe8f6" stopOpacity="0" />
          <stop offset="0.98" stopColor="#ffe8f6" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="33%" cy="27%" r="13%">
          <stop offset="0.2" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {['core', 'sky', 'haze', 'rim', 'shine'].map(layer => (
        <circle key={layer} cx="50" cy="50" r="50" fill={`url(#${id}-${layer})`} />
      ))}
    </svg>
  )
}

function HappyEye({ width }: { width: number }) {
  return (
    <svg width={width} height={width * 0.6} viewBox="0 0 22 13">
      <path d="M2.5 11.5 Q11 -3 19.5 11.5" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </svg>
  )
}

function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(() => {
        setClosed(true)
        timer = window.setTimeout(() => {
          setClosed(false)
          schedule()
        }, 90)
      }, 2600 + Math.random() * 3200)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [enabled])

  return enabled && closed
}

function moodKeyframes(was: BuddyMood | null, mood: BuddyMood, size: number): Keyframe[] | null {
  if (was === null) {
    return [
      { transform: 'scale(0.6)' },
      { transform: 'scale(1.05)', offset: 0.45 },
      { transform: 'scale(0.985)', offset: 0.72 },
      { transform: 'scale(1)' }
    ]
  }
  if (was === 'asleep' && mood !== 'asleep') {
    return [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: `translateY(${-size * 0.03}px) scale(0.94, 1.07)`, offset: 0.25 },
      { transform: 'translateY(2px) scale(1.02, 0.98)', offset: 0.6 },
      { transform: 'translateY(0) scale(1, 1)' }
    ]
  }
  if (mood === 'happy' && was !== 'happy') {
    return [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(0) scale(1.06, 0.94)', offset: 0.14 },
      { transform: `translateY(${-size * 0.07}px) scale(1, 1)`, offset: 0.44, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
      { transform: 'translateY(2px) scale(1.02, 0.98)', offset: 0.7 },
      { transform: 'translateY(0) scale(1, 1)' }
    ]
  }
  if (mood === 'cue' && was !== 'cue') {
    return [
      { transform: 'translateY(0)' },
      { transform: `translateY(${size * 0.025}px)`, offset: 0.3 },
      { transform: 'translateY(-1px)', offset: 0.65 },
      { transform: 'translateY(0)' }
    ]
  }
  return null
}

const MOOD_MS: Record<string, number> = { mount: 620, wake: 640, happy: 800, cue: 600 }

export function Buddy({
  size,
  mood,
  level = 0,
  pulse = 0
}: {
  size: number
  mood: BuddyMood
  level?: number
  pulse?: number
}) {
  const id = `bd${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const jolt = useRef<HTMLDivElement>(null)
  const sway = useRef<HTMLDivElement>(null)
  const previous = useRef<BuddyMood | null>(null)
  const side = useRef(1)

  const asleep = mood === 'asleep'
  const happy = mood === 'happy'
  const blinking = useBlink(!asleep && !happy)
  const eyeWidth = size * 0.08
  const eyeHeight = size * 0.187
  const talk = mood === 'speaking' ? level : 0
  const base = mood === 'cue' ? 1.04 : 1

  useEffect(() => {
    const was = previous.current
    previous.current = mood
    const frames = moodKeyframes(was, mood, size)
    if (!frames || !jolt.current) return
    const duration = was === null ? MOOD_MS.mount : was === 'asleep' ? MOOD_MS.wake : MOOD_MS[mood] ?? 600
    jolt.current.animate(frames, { duration, easing: 'ease-out' })
  }, [mood, size])

  useEffect(() => {
    if (pulse === 0 || !sway.current) return
    side.current = -side.current
    sway.current.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${side.current * 2.2}deg)`, offset: 0.15 },
        { transform: `rotate(${-side.current * 0.8}deg)`, offset: 0.5 },
        { transform: 'rotate(0deg)' }
      ],
      { duration: 600, easing: 'ease-out' }
    )
  }, [pulse])

  return (
    <div className="ah-buddy" style={{ width: size * 1.3, height: size * 1.25 }}>
      {pulse > 0 && (
        <i key={pulse} className="ah-buddy__ring" style={{ top: size * 0.15, width: size, height: size }} />
      )}
      <svg
        className="ah-buddy__floor"
        style={{ top: size * 1.08, opacity: asleep ? 0.35 : 0.8 }}
        width={size * 0.8}
        height={size * 0.2}
        viewBox="0 0 80 20"
      >
        <defs>
          <radialGradient id={`${id}-floor`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={AURORA_1} stopOpacity="0.55" />
            <stop offset="1" stopColor={AURORA_1} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="40" cy="10" rx="40" ry="10" fill={`url(#${id}-floor)`} />
      </svg>
      <div ref={jolt} className="ah-buddy__jolt" style={{ marginTop: size * 0.15, width: size, height: size }}>
        <div ref={sway} className="ah-buddy__sway">
          <div
            className="ah-buddy__pose"
            style={{
              transform: `translateY(${asleep ? size * 0.03 : 0}px) scale(${base * (1 + talk * 0.04)}, ${base * (1 - talk * 0.03)})`,
              opacity: asleep ? 0.82 : 1,
              transition: `transform 520ms ${SPRING}, opacity 400ms ease`
            }}
          >
            <div className={`ah-buddy__breath${asleep ? ' is-asleep' : ''}`}>
              <Sphere size={size} id={id} />
              <div
                className="ah-buddy__face"
                style={{
                  top: size * 0.44 - eyeHeight / 2,
                  height: eyeHeight,
                  gap: size * 0.173,
                  transform: `translateY(${mood === 'speaking' ? -size * 0.06 : 0}px)`
                }}
              >
                {happy ? (
                  <>
                    <HappyEye width={eyeWidth * 1.9} />
                    <HappyEye width={eyeWidth * 1.9} />
                  </>
                ) : (
                  [0, 1].map(eye => (
                    <i
                      key={eye}
                      className="ah-buddy__eye"
                      style={{
                        width: eyeWidth,
                        height: eyeHeight * (asleep ? 0.14 : blinking ? 0.12 : 1),
                        borderRadius: eyeWidth,
                        transform: `translateY(${asleep ? eyeHeight * 0.3 : 0}px)`
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
