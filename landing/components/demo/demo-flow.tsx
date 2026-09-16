'use client'

import { useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Headphones, Smartphone, Watch } from 'lucide-react'
import { firstSyllable } from '@/lib/phonology'
import { Logo } from '@/components/v3/logo'
import { DeskListener, type Mode, type Rung } from './desk-listener'
import { Orb } from '@/components/v3/orb'
import { GraphCanvas, type GraphHighlight } from './graph-canvas'

type Stage = 'fork' | 'questions' | 'live'
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

const SURFACES = [
  {
    icon: Watch,
    title: 'O relógio no pulso',
    body: 'A dica chega como vibração: um pulso por sílaba, o longo na sílaba forte. Só quem usa percebe.'
  },
  {
    icon: Smartphone,
    title: 'O celular na mesa',
    body: 'Escuta o ambiente e percebe sozinho a pausa de 1,3 segundo no meio da frase.'
  },
  {
    icon: Headphones,
    title: 'O fone no ouvido',
    body: 'A sílaba de entrada sussurrada, no volume de quem está contando um segredo.'
  }
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

  const active = mode === 'hint' ? [rungs[3]!] : rungs

  const present: NodeId[] = guided
    ? (['owner', 'person', 'place'] as NodeId[]).slice(0, index)
    : ['owner', 'person', 'place']

  const highlight: GraphHighlight =
    stage !== 'live' || level === 0
      ? null
      : mode === 'hint'
        ? 'syllable'
        : (['family', 'person', 'place', 'syllable'] as GraphHighlight[])[level - 1]!

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

  function submit() {
    const question = QUESTIONS[index]
    const trimmed = draft.trim()
    if (!question || !trimmed) return
    setSeed(previous => ({ ...previous, [question.key]: trimmed.slice(0, MAX_ANSWER) }))
    setDraft('')
    if (index === QUESTIONS.length - 1) {
      setIndex(index + 1)
      window.setTimeout(() => setStage('live'), 1100)
      return
    }
    setIndex(index + 1)
  }

  if (stage === 'fork') {
    return (
      <Shell>
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
              setStage('live')
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
      <Shell>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-8 flex gap-1.5" aria-hidden="true">
              {QUESTIONS.map((item, i) => (
                <i
                  key={item.key}
                  className={`block h-[3px] flex-1 rounded-sm transition-colors duration-500 ${
                    i < index ? 'bg-[var(--v3-accent)]' : 'bg-[var(--v3-line)]'
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

  return (
    <Shell>
      <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_1fr]">
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

        <div className="flex flex-col gap-6">
          <GraphCard caption="Cada degrau acende a aresta que o sustenta.">
            <GraphCanvas
              seed={seed}
              present={present}
              highlight={highlight}
              syllable={firstSyllable(seed.person)}
            />
          </GraphCard>

          <div className="rounded-[1.5rem] border border-[var(--v3-line)] bg-white p-7">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
              Isto aqui é uma simulação
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
              Nesta tela você toca para subir cada degrau. Na vida real ninguém toca nada, e é aí
              que o eilo faz sentido de verdade.
            </p>

            <ul className="mt-6 flex flex-col gap-5">
              {SURFACES.map(surface => (
                <li key={surface.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e4e0fb] text-[var(--v3-accent)]">
                    <surface.icon className="size-4" />
                  </span>
                  <p className="text-[0.9rem] leading-relaxed text-[var(--v3-muted)]">
                    <strong className="text-[var(--v3-ink)]">{surface.title}.</strong>{' '}
                    {surface.body}
                  </p>
                </li>
              ))}
            </ul>

            <a
              href="/v3#baixar"
              className="mt-6 inline-flex items-center gap-2 text-[0.88rem] font-semibold text-[var(--v3-accent)]"
            >
              Levar para o aparelho
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function GraphCard({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--v3-line)] bg-white p-7">
      <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
        O seu mapa
      </p>
      <div className="mt-5 [--brand:#6b5fa8] [--dim:#6c6479] [--faint:#b6b0c6] [--fg:#1b1a22] [--line:#e0dcee] [--mastery-medium:#8d7fbe]">
        {children}
      </div>
      {caption ? (
        <p className="mt-4 min-h-[2.6rem] text-[0.9rem] leading-relaxed text-[var(--v3-muted)]">
          {caption}
        </p>
      ) : null}
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="v3 min-h-dvh">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/v3"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--v3-line)] bg-white px-4 py-2 text-[0.84rem] font-medium text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-ink)]"
          >
            <ArrowLeft className="size-4" />
            voltar
          </a>
          <a href="/v3" className="inline-flex items-center">
            <Logo className="h-7" />
          </a>
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </main>
  )
}
