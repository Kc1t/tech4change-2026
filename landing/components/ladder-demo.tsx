'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RUNGS = [
  { kind: 'categoria', text: 'é da família' },
  { kind: 'relação', text: 'da geração dos netos' },
  { kind: 'lugar', text: 'mora em Sorocaba' },
  { kind: 'fonológica', text: 'Le…' }
]

const STEP_MS = 1500

export function LadderDemo() {
  const [shown, setShown] = useState(0)
  const [resolved, setResolved] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    run()
    return clear
  }, [])

  function clear() {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  function run() {
    clear()
    setShown(0)
    setResolved(false)
    RUNGS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setShown(i + 1), STEP_MS * (i + 1)))
    })
    timers.current.push(
      window.setTimeout(() => setResolved(true), STEP_MS * (RUNGS.length + 1))
    )
  }

  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[28px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_18px_50px_-20px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <span className="label-caps">domingo, 11h04</span>
        <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-faint">
          <i className="block size-1.5 animate-pulse rounded-full bg-mastery-low" />
          escutando
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="voice rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3 text-[1.05rem] leading-snug">
          <span className="label-caps mb-1 block">Rodrigo, filho</span>
          Mãe, quem que vem no domingo?
        </p>
        <p className="voice rounded-2xl rounded-bl-sm border border-line-soft px-4 py-3 text-[1.05rem] leading-snug">
          <span className="label-caps mb-1 block">Helena</span>
          É a minha… a minha…
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2" aria-live="polite">
        {RUNGS.slice(0, shown).map((rung, i) => (
          <div
            key={rung.kind}
            className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-line-soft px-4 py-3 duration-500 ${
              i < shown - 1 && !resolved ? 'opacity-45' : ''
            }`}
          >
            <span className="label-caps">
              degrau {i + 1} · {rung.kind}
            </span>
            <p className="voice mt-0.5 text-[1.05rem]">{rung.text}</p>
          </div>
        ))}

        {shown === 0 && (
          <div className="rounded-xl bg-primary px-4 py-5 text-center text-lg font-bold text-primary-foreground">
            Travou
          </div>
        )}
      </div>

      {resolved && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <p className="voice text-[2rem] leading-none text-primary">Letícia</p>
          <p className="mt-2 text-xs text-dim">
            Quem disse a palavra foi ela. Em 4 degraus. Da próxima vez, começa em 3.
          </p>
          <Button variant="ghost" size="sm" onClick={run} className="mt-3 -ml-2 text-dim">
            <RotateCcw className="size-3.5" />
            ver de novo
          </Button>
        </div>
      )}
    </div>
  )
}
