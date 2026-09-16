'use client'

import { useEffect, useRef, useState } from 'react'
import { lifeGraph, useApp } from '@/store'
import { canVibrate, pulse } from '@/channels'
import { cueFor, durationOf, type HapticCue } from '@/domain/haptics'
import { cueable } from '@/domain/phonology'
import type { Mastery } from '@/domain/types'

const RUNG_LABEL: Record<HapticCue['rung'], string> = {
  nudge: 'toque',
  count: 'compasso',
  rhythm: 'compasso completo',
  onset: 'entrada e compasso'
}

const MASTERY_LABEL: Record<Mastery, string> = {
  unseen: 'ainda não travou aqui',
  low: 'trava quase sempre',
  medium: 'trava às vezes',
  high: 'já vem sozinha'
}

interface Mark {
  text: string
  ms: number
  stressed: boolean
  attack: boolean
}

function marksOf(cue: HapticCue): Mark[] {
  if (cue.rung === 'nudge') {
    return [{ text: '', ms: cue.beats[0]!, stressed: false, attack: false }]
  }

  const body = cue.syllables.map((text, index) => ({
    text,
    ms: cue.beats[index]!,
    stressed: cue.rung !== 'count' && index === cue.stress,
    attack: false
  }))

  return cue.rung === 'onset'
    ? [{ text: '', ms: cue.pattern[0]!, stressed: false, attack: true }, ...body]
    : body
}

function schedule(pattern: number[]): number[] {
  const starts: number[] = []
  let at = 0
  pattern.forEach((value, index) => {
    if (index % 2 === 0) starts.push(at)
    at += value
  })
  return starts
}

export function HapticWords() {
  const learning = useApp(s => s.learning)
  const channels = useApp(s => s.channels)
  const intensity = useApp(s => s.intensity)
  const learningFor = useApp(s => s.learningFor)

  const [playing, setPlaying] = useState<{ id: string; mark: number } | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => timers.current.forEach(window.clearTimeout)
  }, [])

  const words = Object.values(lifeGraph.nodes)
    .filter(node => node.id !== lifeGraph.owner && cueable(node.label))
    .map(node => ({
      node,
      cue: cueFor(node.label, learningFor(node.id), node.phon),
      mastery: learningFor(node.id).mastery
    }))

  function play(id: string, cue: HapticCue) {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    pulse(cue.pattern, { ...channels, phone: true }, intensity, true)

    schedule(cue.pattern).forEach((at, mark) => {
      timers.current.push(window.setTimeout(() => setPlaying({ id, mark }), at))
    })
    timers.current.push(
      window.setTimeout(() => setPlaying(null), durationOf(cue.pattern) + 220)
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {words.map(({ node, cue, mastery }) => {
        const marks = marksOf(cue)
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => play(node.id, cue)}
            className="flex flex-col gap-3 rounded-card bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] p-4 text-left"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold">{node.label}</h3>
              <span className="label-caps shrink-0">{RUNG_LABEL[cue.rung]}</span>
            </div>

            <div className="flex items-end gap-[6px]" aria-hidden>
              {marks.map((mark, index) => {
                const active = playing?.id === node.id && playing.mark === index
                return (
                  <span key={index} className="flex flex-col items-center gap-1.5">
                    <span
                      style={{ width: Math.max(11, Math.round(mark.ms * 0.4)) }}
                      className={[
                        'block rounded-full transition-all duration-100',
                        mark.attack ? 'h-[7px]' : mark.stressed ? 'h-[13px]' : 'h-[7px]',
                        active
                          ? 'bg-brand'
                          : mark.stressed
                            ? 'bg-fg'
                            : mark.attack
                              ? 'bg-dim'
                              : 'bg-dim/40'
                      ].join(' ')}
                    />
                    <span className="text-[0.6rem] leading-none text-faint">
                      {mark.attack ? '·' : mark.text}
                    </span>
                  </span>
                )
              })}
            </div>

            <p className="text-[0.72rem] leading-relaxed text-dim">
              {MASTERY_LABEL[mastery]} — {cue.caption}
            </p>
          </button>
        )
      })}

      {!canVibrate && (
        <p className="border-l-2 border-line pl-3 text-[0.72rem] leading-relaxed text-faint">
          Este navegador não vibra. Você vê o compasso acender; para sentir, abra no Chrome do
          Android.
        </p>
      )}
    </div>
  )
}
