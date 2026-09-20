'use client'

import { useState } from 'react'
import { BrandMark } from '@/components/layout'
import { SEED_QUESTIONS, clean, isComplete, type Seed, type SeedKey } from '@/domain/seed'

export function OnboardingScreen({
  onDone,
  onExample
}: {
  onDone: (seed: Seed) => void
  onExample: () => void
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Seed>>({})
  const [typed, setTyped] = useState('')

  const step = SEED_QUESTIONS[index]!
  const last = index === SEED_QUESTIONS.length - 1
  const filled = clean(typed).length > 0

  function commit(value: string) {
    const next = { ...answers, [step.key as SeedKey]: clean(value) || undefined }
    setAnswers(next)
    setTyped('')

    if (last) {
      if (isComplete(next)) onDone(next as Seed)
      return
    }

    setIndex(index + 1)
  }

  function back() {
    if (index === 0) return
    setIndex(index - 1)
    setTyped(answers[SEED_QUESTIONS[index - 1]!.key] ?? '')
  }

  return (
    <section className="flex h-full flex-col px-7 pb-8 pt-[calc(22px+env(safe-area-inset-top,0px))]">
      <div className="flex h-11 shrink-0 items-center justify-between">
        <BrandMark />
        {index > 0 && (
          <button onClick={back} className="min-h-tap px-2 text-[13px] font-semibold text-dim">
            Voltar
          </button>
        )}
      </div>

      <div className="mt-8 flex shrink-0 gap-1.5">
        {SEED_QUESTIONS.map((question, position) => (
          <span
            key={question.key}
            className={`h-1 flex-1 rounded-full ${
              position <= index ? 'bg-brand' : 'bg-surface-2'
            }`}
          />
        ))}
      </div>

      <p className="label-caps mt-8">
        pergunta {index + 1} de {SEED_QUESTIONS.length}
      </p>

      <h2 className="voice mt-3 text-[28px] leading-tight tracking-[-0.03em]">{step.question}</h2>

      <p className="mt-3 text-[15px] leading-relaxed text-dim">{step.note}</p>

      <form
        onSubmit={event => {
          event.preventDefault()
          if (filled) commit(typed)
        }}
        className="mt-7 flex flex-col gap-3"
      >
        <input
          value={typed}
          onChange={event => setTyped(event.target.value)}
          placeholder={step.placeholder}
          aria-label={step.question}
          autoFocus
          autoComplete="off"
          className="min-h-tap rounded-[18px] bg-surface px-5 text-[18px] font-medium text-fg shadow-soft outline-none placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand"
        />

        <button
          type="submit"
          disabled={!filled}
          className="min-h-tap rounded-[18px] bg-fg text-[14px] font-semibold text-ink disabled:opacity-40"
        >
          {last ? 'Montar o meu mapa' : 'Continuar'}
        </button>
      </form>

      {step.optional && (
        <button
          onClick={() => commit('')}
          className="mt-2 min-h-tap text-[13px] font-semibold text-faint"
        >
          Pular esta
        </button>
      )}

      {index === 0 && (
        <button onClick={onExample} className="mt-2 min-h-tap text-[13px] font-semibold text-brand">
          Ver com um exemplo pronto
        </button>
      )}

      <p className="mt-auto pt-8 text-[0.72rem] leading-relaxed text-faint">
        Estas respostas ficam neste aparelho e montam o seu mapa. Nenhuma delas é enviada para lugar
        nenhum.
      </p>
    </section>
  )
}
