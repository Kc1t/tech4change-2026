'use client'

import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3010'
const MAX_ANSWER = 40

type Key = 'owner' | 'person' | 'place'

const QUESTIONS: Array<{ key: Key; question: string; note: string; placeholder: string }> = [
  {
    key: 'owner',
    question: 'Como a gente te chama?',
    note: 'Vai no centro do seu mapa.',
    placeholder: 'seu nome'
  },
  {
    key: 'person',
    question: 'O nome de alguém que você vê toda semana.',
    note: 'É quem o aplicativo vai te ajudar a alcançar.',
    placeholder: 'um nome'
  },
  {
    key: 'place',
    question: 'Em que cidade essa pessoa mora?',
    note: 'Vira o segundo degrau da escada.',
    placeholder: 'uma cidade'
  }
]

const EMPTY: Record<Key, string> = { owner: '', person: '', place: '' }

function encodeSeed(answers: Record<Key, string>): string {
  const json = JSON.stringify(answers)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function SeedForm() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(EMPTY)
  const [draft, setDraft] = useState('')

  const done = index >= QUESTIONS.length
  const question = QUESTIONS[index]
  const trimmed = draft.trim()

  const link = useMemo(() => {
    if (!done) return ''
    return `${APP_URL}/#seed=${encodeSeed(answers)}`
  }, [done, answers])

  function submit() {
    if (!question || trimmed.length === 0) return
    setAnswers(previous => ({ ...previous, [question.key]: trimmed.slice(0, MAX_ANSWER) }))
    setDraft('')
    setIndex(index + 1)
  }

  function restart() {
    setAnswers(EMPTY)
    setDraft('')
    setIndex(0)
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="mb-6 flex gap-1.5" aria-hidden="true">
        {QUESTIONS.map((item, i) => (
          <i
            key={item.key}
            className={`block h-[3px] flex-1 rounded-sm ${i < index ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </div>

      {question ? (
        <form
          onSubmit={event => {
            event.preventDefault()
            submit()
          }}
        >
          <p className="label-caps">
            pergunta {index + 1} de {QUESTIONS.length}
          </p>
          <h3 className="voice mt-3 text-[clamp(1.3rem,3vw,1.7rem)] leading-tight text-balance">
            {question.question}
          </h3>
          <p className="mt-2 text-sm text-dim">{question.note}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder={question.placeholder}
              maxLength={MAX_ANSWER}
              autoFocus
              aria-label={question.question}
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-ink px-4 text-base outline-none placeholder:text-faint focus-visible:border-accent"
            />
            <Button type="submit" size="lg" disabled={trimmed.length === 0}>
              {index === QUESTIONS.length - 1 ? 'Montar o mapa' : 'Continuar'}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <p className="label-caps">seu mapa está pronto</p>
          <h3 className="voice mt-3 text-[clamp(1.3rem,3vw,1.7rem)] leading-tight text-balance">
            Três respostas viraram um grafo com três nós e duas arestas.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            O que você digitou não vai para o nosso servidor. Viaja no fragmento da URL — a parte
            depois do <code className="tabular text-fg">#</code>, que por especificação o navegador
            nunca envia. O grafo é montado dentro do aplicativo, no seu aparelho.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-md border border-line-soft bg-ink p-4 text-[0.72rem] leading-relaxed text-dim">
            <code>{link.replace(/^https?:\/\/[^/]+/, '')}</code>
          </pre>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={link}>
                Abrir o aplicativo com o seu mapa
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-line" onClick={restart}>
              Responder de novo
            </Button>
          </div>

          <p className="mt-5 text-[0.72rem] leading-relaxed text-faint">
            No celular, depois que o aplicativo abrir, o botão <strong>instalar</strong> no topo
            adiciona à tela inicial. Não existe arquivo para baixar nem loja para aprovar — é um
            aplicativo web instalável.
          </p>
        </div>
      )}
    </div>
  )
}
