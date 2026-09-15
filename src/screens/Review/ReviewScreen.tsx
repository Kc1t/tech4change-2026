import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/store'
import { vibrate } from '@/channels'

const SUGGESTIONS = [
  { name: 'Letícia', relation: 'neta', detail: '84 fotos · citada como “Lelê”' },
  { name: 'Marina', relation: 'filha', detail: '312 fotos · contato diário' },
  { name: 'Rodrigo', relation: 'filho', detail: '204 fotos · contato diário' },
  { name: 'Tupi', relation: 'animal', detail: 'cachorro preto em 63 fotos' },
  { name: 'Ubatuba', relation: 'lugar', detail: '47 fotos entre 28/12 e 03/01' }
]

export function ReviewScreen() {
  const channels = useApp(s => s.channels)
  const intensity = useApp(s => s.intensity)
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set())
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    startedAt.current = Date.now()
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.current) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function confirm(index: number) {
    vibrate('confirm', channels, intensity)
    setConfirmed(previous => new Set(previous).add(index))
  }

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">primeiro acesso · revisão</p>
        <h2 className="voice mt-2 text-xl leading-tight">Confira o que encontramos</h2>
        <p className="mt-1 text-xs text-dim">
          Ninguém escreve nada do zero. A família confirma ou corrige, uma vez só.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {SUGGESTIONS.map((suggestion, index) => {
          const done = confirmed.has(index)
          return (
            <div
              key={suggestion.name}
              className={[
                'flex items-center gap-3 rounded-card border bg-surface p-4',
                done ? 'border-mastery-high' : 'border-line'
              ].join(' ')}
            >
              <span className="voice grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-lg text-dim">
                {suggestion.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <h3 className="text-base font-semibold">
                  {suggestion.name} · {suggestion.relation}
                </h3>
                <p className="mt-0.5 text-[0.7rem] text-faint">{suggestion.detail}</p>
              </span>
              <button
                onClick={() => confirm(index)}
                className={[
                  'rounded-full border px-3.5 py-2.5 text-[0.74rem] font-semibold',
                  done
                    ? 'border-mastery-high bg-mastery-high text-ink'
                    : 'border-line text-fg'
                ].join(' ')}
              >
                {done ? 'Confirmado' : 'Confirmar'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="tabular text-[0.72rem] text-faint">tempo nesta tela: {elapsed}s</p>

      <p className="text-[0.68rem] leading-relaxed text-faint">
        Produtos parecidos dependem de a família preencher formulário toda semana. É por isso que são
        abandonados. Aqui a IA propõe e a confirmação acontece uma vez.
      </p>
    </section>
  )
}
