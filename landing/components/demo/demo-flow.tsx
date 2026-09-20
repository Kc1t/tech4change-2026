'use client'

import { useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, AudioLines, Heart, RotateCcw } from 'lucide-react'
import { firstSyllable } from '@/lib/phonology'
import { Logo } from '@/components/v3/logo'
import { Brief } from './brief'
import { DeskListener, type Mode, type Rung } from './desk-listener'
import { Orb } from '@/components/v3/orb'
import { GraphCanvas } from './graph-canvas'
import { LadderPanel } from './ladder-panel'
import { WatchPulse } from './watch-pulse'

type Stage = 'fork' | 'questions' | 'brief' | 'live'
type Key = 'owner' | 'person' | 'place'
type NodeId = 'owner' | 'person' | 'place'

const HELENA = { owner: 'Helena', person: 'Letícia', place: 'Sorocaba' }
const MAX_ANSWER = 40

const QUESTIONS: Array<{ key: Key; question: string; note: string; placeholder: string }> = [
  {
    key: 'owner',
    question: 'Como a gente te chama?',
    note: 'Vai no centro do seu mapa, o único nó que já nasce com você.',
    placeholder: 'seu nome'
  },
  {
    key: 'person',
    question: 'O nome de alguém que você vê toda semana.',
    note: 'É quem o aplicativo vai te ajudar a alcançar quando a palavra travar.',
    placeholder: 'um nome'
  },
  {
    key: 'place',
    question: 'Em que cidade essa pessoa mora?',
    note: 'Vira um degrau da escada. O lugar costuma destravar antes do som.',
    placeholder: 'uma cidade'
  }
]

const GRAPH_CAPTION = [
  'Zero. Nenhum nó, nenhuma aresta, nada sobre você em lugar nenhum.',
  'Um nó. O mapa é seu e começa em você.',
  'Dois nós e a primeira aresta. Já existe um caminho.',
  'Três nós, duas arestas. É com isso que a escada vai trabalhar.'
]


export function DemoFlow() {
  const [stage, setStage] = useState<Stage>('fork')
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(HELENA)
  const [draft, setDraft] = useState('')

  const [mode, setMode] = useState<Mode>('ladder')
  const [level, setLevel] = useState(0)
  const [resolvedAt, setResolvedAt] = useState<number | null>(null)
  const [guided, setGuided] = useState(false)

  const rungs: Rung[] = [
    { level: 1, kind: 'categoria', text: 'é da família' },
    { level: 2, kind: 'relação', text: 'da geração dos netos' },
    { level: 3, kind: 'lugar', text: `mora em ${seed.place}` },
    { level: 4, kind: 'fonológica', text: `${firstSyllable(seed.person)}…` }
  ]

  const active = mode === 'hint' ? [{ ...rungs[3]!, level: 1 }] : rungs

  const present: NodeId[] = guided
    ? (['owner', 'person', 'place'] as NodeId[]).slice(0, index)
    : ['owner', 'person', 'place']

  function advance() {
    if (resolvedAt !== null) return
    setLevel(current => Math.min(current + 1, active.length))
  }

  function succeed() {
    setResolvedAt(level)
  }

  function reset() {
    setLevel(0)
    setResolvedAt(null)
  }

  function changeMode(next: Mode) {
    setMode(next)
    reset()
  }

  function restart() {
    reset()
    setIndex(0)
    setDraft('')
    setStage('fork')
  }

  function back() {
    if (index === 0) {
      setDraft('')
      setStage('fork')
      return
    }
    const previous = QUESTIONS[index - 1]
    if (!previous) return
    setDraft(seed[previous.key])
    setIndex(index - 1)
  }

  function submit() {
    const question = QUESTIONS[index]
    const trimmed = draft.trim()
    if (!question || !trimmed) return
    setSeed(previous => ({ ...previous, [question.key]: trimmed.slice(0, MAX_ANSWER) }))
    setDraft('')
    if (index === QUESTIONS.length - 1) {
      setIndex(index + 1)
      window.setTimeout(() => setStage('brief'), 1100)
      return
    }
    setIndex(index + 1)
  }

  const steps = guided ? GUIDED_STEPS : DIRECT_STEPS

  if (stage === 'fork') {
    return (
      <Shell step={1} steps={steps}>
        <div className="flex flex-col items-center text-center">
          <Orb className="w-[clamp(168px,20vw,236px)]" />
          <p className="mt-10 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
            Demonstração
          </p>
          <h1 className="mt-4 max-w-2xl text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.1] font-medium tracking-[-0.035em] text-balance">
            Como você quer ver a palavra ser alcançada?
          </h1>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setGuided(true)
              setSeed({ owner: '', person: '', place: '' })
              setIndex(0)
              setStage('questions')
            }}
            className="group v3-tile-1 flex flex-col rounded-[1.5rem] p-8 text-left transition-transform hover:-translate-y-1"
          >
            <span className="tabular text-[2.4rem] leading-none font-medium text-[var(--v3-accent)]">
              01
            </span>
            <span className="mt-6 text-[1.3rem] leading-snug font-medium tracking-[-0.03em]">
              A experiência completa
            </span>
            <span className="mt-3 text-[0.95rem] leading-relaxed text-[#5b5470]">
              Três perguntas e o mapa se monta na sua frente a partir do zero, com gente da sua
              vida. Leva menos de um minuto.
            </span>
            <span className="mt-7 flex items-center gap-2 text-[0.88rem] font-semibold text-[var(--v3-accent)]">
              Começar do zero
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGuided(false)
              setSeed(HELENA)
              setStage('brief')
            }}
            className="group flex flex-col rounded-[1.5rem] border border-[var(--v3-line)] bg-white p-8 text-left transition-transform hover:-translate-y-1"
          >
            <span className="tabular text-[2.4rem] leading-none font-medium text-[#b6b0c6]">02</span>
            <span className="mt-6 text-[1.3rem] leading-snug font-medium tracking-[-0.03em]">
              Direto para a escada
            </span>
            <span className="mt-3 text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
              Pula as perguntas e cai na escuta com o mapa da Helena já montado, para ver o
              mecanismo funcionando agora.
            </span>
            <span className="mt-7 flex items-center gap-2 text-[0.88rem] font-semibold text-[var(--v3-ink)]">
              Ir direto
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </Shell>
    )
  }

  if (stage === 'questions') {
    const question = QUESTIONS[index]
    const trimmed = draft.trim()

    return (
      <Shell step={2} steps={steps}>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-8 flex gap-1.5" aria-hidden="true">
              {QUESTIONS.map((item, i) => (
                <i
                  key={item.key}
                  className={`block h-[3px] flex-1 rounded-sm transition-colors duration-500 ${
                    i < index
                      ? 'bg-[var(--v3-accent)]'
                      : i === index
                        ? 'bg-[#c9bdf0]'
                        : 'bg-[var(--v3-line)]'
                  }`}
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
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
                  Pergunta {index + 1} de {QUESTIONS.length}
                </p>
                <h2 className="mt-4 text-[clamp(1.7rem,3.6vw,2.5rem)] leading-tight font-medium tracking-[-0.035em] text-balance">
                  {question.question}
                </h2>
                <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-[var(--v3-muted)]">
                  {question.note}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <input
                    key={question.key}
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    placeholder={question.placeholder}
                    maxLength={MAX_ANSWER}
                    autoFocus
                    aria-label={question.question}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--v3-line)] bg-white px-5 text-base outline-none placeholder:text-[#b6b0c6] focus-visible:border-[var(--v3-accent)]"
                  />
                  <button
                    type="submit"
                    disabled={!trimmed}
                    className="v3-dark-btn inline-flex h-12 items-center gap-2 rounded-xl px-7 text-[0.92rem] font-medium text-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    {index === QUESTIONS.length - 1 ? 'Montar o mapa' : 'Continuar'}
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={back}
                  className="mt-5 inline-flex items-center gap-2 text-[0.86rem] font-medium text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-accent)]"
                >
                  <ArrowLeft className="size-4" />
                  {index === 0 ? 'Escolher outro caminho' : 'Voltar uma pergunta'}
                </button>
              </form>
            ) : (
              <div>
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
                  Pronto
                </p>
                <h2 className="mt-4 text-[clamp(1.7rem,3.6vw,2.5rem)] leading-tight font-medium tracking-[-0.035em] text-balance">
                  O mapa existe. Agora deixa a palavra travar.
                </h2>
              </div>
            )}

            <p className="mt-9 max-w-md text-[0.78rem] leading-relaxed text-[#8f8aa0]">
              Nada disso sai do seu navegador. As respostas não vão para servidor nenhum: são usadas
              aqui, nesta aba, e somem quando você fechar.
            </p>
          </div>

          <GraphCard caption={GRAPH_CAPTION[Math.min(index, 3)]}>
            <GraphCanvas seed={seed} present={present} />
          </GraphCard>
        </div>
      </Shell>
    )
  }

  if (stage === 'brief') {
    return (
      <Shell step={steps.length - 1} steps={steps}>
        <Brief onStart={() => setStage('live')} />
      </Shell>
    )
  }

  return (
    <Shell step={steps.length} steps={steps}>
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[1.25rem] border border-[var(--v3-line)] bg-white/70 px-6 py-4">
          <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#e9e2fa] px-4 py-2 text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--v3-accent-deep)] uppercase">
            <i aria-hidden="true" className="v3-live-dot block size-2 rounded-full bg-[var(--v3-accent)]" />
            IA ouvindo
          </span>
          <p className="min-w-[18rem] flex-1 text-[0.9rem] leading-relaxed text-[var(--v3-muted)]">
            É um autocompletar de fala. A IA acompanha a conversa, percebe a pausa e ordena o
            caminho até a palavra sobre o seu mapa.
          </p>
          <p className="text-[0.9rem] leading-relaxed text-[var(--v3-muted)] xl:border-l xl:border-[var(--v3-line)] xl:pl-6">
            Ela recebe identificadores opacos:{' '}
            <b className="font-semibold text-[var(--v3-ink)]">nunca vê o nome</b>.
          </p>

          <button
            type="button"
            onClick={restart}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--v3-line)] bg-white px-4 py-2 text-[0.84rem] font-medium text-[var(--v3-ink)] transition-colors hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)]"
          >
            <RotateCcw className="size-4 text-[var(--v3-accent)]" />
            {guided ? 'Trocar as respostas' : 'Começar de novo'}
          </button>
        </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.75fr_1fr]">
        <DeskListener
          prompt={`${seed.owner || 'Você'} está contando quem apareceu no almoço de domingo.`}
          answer={seed.person}
          mode={mode}
          onMode={changeMode}
          rungs={active}
          level={level}
          resolvedAt={resolvedAt}
          onAdvance={advance}
          onSucceed={succeed}
          onReset={reset}
        />

        <div className="flex flex-col gap-5">
          <LadderPanel
            rungs={active}
            level={level}
            answer={seed.person}
            resolved={resolvedAt !== null}
          />

          <WatchPulse word={seed.person} ready={resolvedAt !== null} />
        </div>
      </div>
      </div>
    </Shell>
  )
}

function GraphCard({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--v3-line)] bg-white p-5">
      <div className="flex items-center justify-between gap-4 px-2 pt-1 pb-4">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
          O seu mapa
        </p>
        <p className="text-[0.72rem] text-[#b6b0c6]">vista de grafo</p>
      </div>
      {children}
      {caption ? (
        <p className="mt-4 min-h-[2.6rem] px-2 pb-1 text-[0.9rem] leading-relaxed text-[var(--v3-muted)]">
          {caption}
        </p>
      ) : null}
    </div>
  )
}

const GUIDED_STEPS = ['Começar', 'Seu mapa', 'Como funciona', 'A palavra']
const DIRECT_STEPS = ['Começar', 'Como funciona', 'A palavra']

function Steps({ current, steps }: { current: number; steps: string[] }) {
  return (
    <ol
      aria-label={`Etapa ${current} de ${steps.length}: ${steps[current - 1] ?? ''}`}
      className="mx-auto mt-6 flex max-w-2xl items-start justify-center"
    >
      {steps.map((label, i) => (
        <li
          key={label}
          aria-current={i + 1 === current ? 'step' : undefined}
          className="flex flex-1 items-start last:flex-none"
        >
          <div className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2 sm:w-[7.5rem]">
            <span
              className={`grid size-8 place-items-center rounded-full text-[0.82rem] font-semibold transition-colors ${
                i + 1 === current
                  ? 'bg-[var(--v3-accent)] text-white'
                  : i + 1 < current
                    ? 'bg-[#d9d0f5] text-[var(--v3-accent-deep)]'
                    : 'border border-[var(--v3-line)] bg-white text-[#b6b0c6]'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-center text-[0.76rem] font-medium text-balance sm:text-[0.84rem] ${
                i + 1 === current ? 'text-[var(--v3-accent)]' : 'text-[var(--v3-muted)]'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 ? (
            <i aria-hidden="true" className="mt-4 h-px flex-1 bg-[var(--v3-line)]" />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

function Shell({
  step,
  steps,
  children
}: {
  step: number
  steps: string[]
  children: ReactNode
}) {
  return (
    <main className="v3 v3-stage min-h-dvh">
      <div className="mx-auto max-w-[1400px] px-6 py-7 sm:px-10">
        <header className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white bg-white/80 px-5 py-2.5 text-[0.88rem] font-medium text-[var(--v3-ink)] shadow-[0_12px_30px_-24px_rgba(70,55,120,0.9)] transition-colors hover:text-[var(--v3-accent)]"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </a>

          <a href="/" className="inline-flex justify-self-center">
            <Logo className="h-9" />
          </a>

          <span className="hidden w-fit items-center gap-2.5 justify-self-end rounded-full border border-white bg-white/80 px-5 py-2.5 text-[0.88rem] font-medium text-[var(--v3-ink)] shadow-[0_12px_30px_-24px_rgba(70,55,120,0.9)] md:inline-flex">
            <AudioLines className="size-4 text-[var(--v3-accent)]" />
            Sua vida, mais presente
            <Heart className="size-4 text-[var(--v3-accent)]" />
          </span>
        </header>

        <Steps current={step} steps={steps} />

        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
