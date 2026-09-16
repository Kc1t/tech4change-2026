'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Smartphone, Watch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { firstSyllable } from '@/lib/phonology'
import { GraphCanvas, type GraphHighlight } from './graph-canvas'
import { ListenerScreen, type Mode, type Rung } from './listener-screen'
import { PhoneFrame } from './phone-frame'

type Stage = 'fork' | 'questions' | 'live'
type Key = 'owner' | 'person' | 'place'
type NodeId = 'owner' | 'person' | 'place'

const HELENA = { owner: 'Helena', person: 'Letícia', place: 'Sorocaba' }
const MAX_ANSWER = 40
const STEP_MS = 1400

const QUESTIONS: Array<{ key: Key; question: string; note: string; placeholder: string }> = [
  {
    key: 'owner',
    question: 'Como a gente te chama?',
    note: 'Vai no centro do seu mapa — é o único nó que já nasce com você.',
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
    note: 'Vira um degrau da escada — o lugar costuma destravar antes do som.',
    placeholder: 'uma cidade'
  }
]

const GRAPH_CAPTION = [
  'Zero. Nenhum nó, nenhuma aresta, nada sobre você em lugar nenhum.',
  'Um nó. O mapa é seu e começa em você.',
  'Dois nós e a primeira aresta — já existe um caminho.',
  'Três nós, duas arestas. É com isso que a escada vai trabalhar.'
]

export function DemoFlow() {
  const [stage, setStage] = useState<Stage>('fork')
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(HELENA)
  const [draft, setDraft] = useState('')

  const [mode, setMode] = useState<Mode>('ladder')
  const [armed, setArmed] = useState(false)
  const [shown, setShown] = useState(0)
  const [resolved, setResolved] = useState(false)
  const [settled, setSettled] = useState(false)

  const timers = useRef<number[]>([])
  const [guided, setGuided] = useState(false)

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (stage !== 'live') return
    const timer = window.setTimeout(() => setSettled(true), 1600)
    return () => window.clearTimeout(timer)
  }, [stage])

  function clearTimers() {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  const rungs: Rung[] = [
    { level: 1, kind: 'categoria', text: 'é da família' },
    { level: 2, kind: 'relação', text: 'da geração dos netos' },
    { level: 3, kind: 'lugar', text: `mora em ${seed.place}` },
    { level: 4, kind: 'fonológica', text: `${firstSyllable(seed.person)}…` }
  ]

  const active = mode === 'hint' ? [rungs[3]!] : rungs
  const status = settled ? 'escutando' : 'ajustando ao ambiente'

  const present: NodeId[] = guided
    ? (['owner', 'person', 'place'] as NodeId[]).slice(0, index)
    : ['owner', 'person', 'place']

  const highlight: GraphHighlight =
    stage !== 'live' || shown === 0
      ? null
      : mode === 'hint'
        ? 'syllable'
        : (['family', 'person', 'place', 'syllable'] as GraphHighlight[])[shown - 1]!

  function arm() {
    setArmed(true)
    clearTimers()
    active.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setShown(i + 1), STEP_MS * (i + 1)))
    })
    timers.current.push(
      window.setTimeout(() => setResolved(true), STEP_MS * (active.length + 1))
    )
  }

  function reset() {
    clearTimers()
    setArmed(false)
    setShown(0)
    setResolved(false)
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
      setSettled(false)
      window.setTimeout(() => setStage('live'), 1100)
      return
    }
    setIndex(index + 1)
  }

  if (stage === 'fork') {
    return (
      <Shell>
        <p className="label-caps">
          demonstração
        </p>
        <h1 className="mt-4 max-w-2xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.06] font-medium tracking-[-0.035em] text-balance">
          Como você quer ver a
          <span className="display italic"> palavra ser alcançada?</span>
        </h1>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setGuided(true)
              setSeed({ owner: '', person: '', place: '' })
              setIndex(0)
              setStage('questions')
            }}
            className="group flex flex-col rounded-[1.75rem] border border-line bg-surface p-7 text-left transition-colors hover:border-brand-rose"
          >
            <span className="display text-[2.4rem] leading-none text-brand-warm">01</span>
            <span className="mt-5 text-[1.25rem] leading-snug font-medium tracking-[-0.03em]">
              A experiência completa
            </span>
            <span className="mt-3 text-[0.95rem] leading-relaxed text-dim">
              Três perguntas, e o mapa se monta na sua frente a partir do zero — com gente da sua
              vida, não da nossa. Leva menos de um minuto.
            </span>
            <span className="mt-6 flex items-center gap-2 text-[0.85rem] font-semibold text-primary">
              Começar do zero
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGuided(false)
              setSeed(HELENA)
              setSettled(false)
              setStage('live')
            }}
            className="group flex flex-col rounded-[1.75rem] border border-line bg-surface p-7 text-left transition-colors hover:border-brand-rose"
          >
            <span className="display text-[2.4rem] leading-none text-faint">02</span>
            <span className="mt-5 text-[1.25rem] leading-snug font-medium tracking-[-0.03em]">
              Direto para a escada
            </span>
            <span className="mt-3 text-[0.95rem] leading-relaxed text-dim">
              Pula as perguntas e cai no aparelho com o mapa da Helena já montado. É o caminho de
              quem quer ver o mecanismo funcionando agora.
            </span>
            <span className="mt-6 flex items-center gap-2 text-[0.85rem] font-semibold text-fg">
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
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-7 flex gap-1.5" aria-hidden="true">
              {QUESTIONS.map((item, i) => (
                <i
                  key={item.key}
                  className={`block h-[3px] flex-1 rounded-sm transition-colors duration-500 ${
                    i < index ? 'bg-brand-warm' : 'bg-line'
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
                <p className="label-caps">
                  pergunta {index + 1} de {QUESTIONS.length}
                </p>
                <h2 className="mt-4 text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-medium tracking-[-0.035em] text-balance">
                  {question.question}
                </h2>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-dim">
                  {question.note}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <input
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    placeholder={question.placeholder}
                    maxLength={MAX_ANSWER}
                    autoFocus
                    aria-label={question.question}
                    className="h-12 min-w-0 flex-1 rounded-full border border-line bg-ink px-5 text-base outline-none placeholder:text-faint focus-visible:border-brand-rose"
                  />
                  <Button type="submit" size="lg" disabled={!trimmed} className="rounded-full">
                    {index === QUESTIONS.length - 1 ? 'Montar o mapa' : 'Continuar'}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p className="label-caps">
                  pronto
                </p>
                <h2 className="mt-4 text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-medium tracking-[-0.035em] text-balance">
                  O mapa existe. Agora deixa a palavra travar.
                </h2>
              </div>
            )}

            <p className="mt-8 text-[0.72rem] leading-relaxed text-faint">
              Nada disso sai do seu navegador. As respostas não vão para servidor nenhum — são
              usadas aqui, nesta aba, e somem quando você fechar.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-surface p-6">
            <p className="label-caps">
              o seu mapa
            </p>
            <div className="mt-4">
              <GraphCanvas seed={seed} present={present} />
            </div>
            <p className="mt-3 min-h-[2.5rem] text-[0.88rem] leading-relaxed text-dim">
              {GRAPH_CAPTION[Math.min(index, 3)]}
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1fr]">
        <PhoneFrame>
          <ListenerScreen
            owner={seed.owner || 'Você'}
            answer={seed.person}
            status={status}
            mode={mode}
            onMode={changeMode}
            rungs={active}
            shown={shown}
            resolved={resolved}
            armed={armed}
            onArm={arm}
            onReset={reset}
          />
        </PhoneFrame>

        <div>
          <p className="label-caps">
            o aparelho e o mapa, lado a lado
          </p>
          <h2 className="mt-4 text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-medium tracking-[-0.035em] text-balance">
            Cada degrau acende
            <span className="display italic"> a aresta que o sustenta.</span>
          </h2>
          <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-dim">
            Aperte <strong className="text-fg">Travou</strong> no aparelho. A dica não vem de um
            modelo que adivinha: cada degrau cita uma ligação que existe neste mapa, e você vê qual
            é, acendendo à direita. Troque para <strong className="text-fg">Dica</strong> e a escada
            inteira vira um degrau só — é a configuração que o fonoaudiólogo controla.
          </p>

          <div className="mt-7 rounded-[1.75rem] border border-line bg-surface p-6">
            <GraphCanvas
              seed={seed}
              present={present}
              highlight={highlight}
              syllable={firstSyllable(seed.person)}
            />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-line-soft bg-surface-2 p-6">
            <p className="label-caps">isto aqui é uma simulação</p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-dim">
              Numa tela de computador você aperta <strong className="text-fg">Travou</strong>. Na
              vida real ninguém aperta nada — e é aí que o Eilo faz sentido de verdade.
            </p>

            <ul className="mt-5 flex flex-col gap-4">
              <li className="flex gap-3">
                <Smartphone className="mt-0.5 size-4 shrink-0 text-brand-warm" />
                <p className="text-[0.9rem] leading-relaxed text-dim">
                  <strong className="text-fg">O celular na mesa ou no bolso.</strong> Ele escuta o
                  ambiente e percebe sozinho a pausa de 1,3 segundo no meio da frase.
                </p>
              </li>
              <li className="flex gap-3">
                <Watch className="mt-0.5 size-4 shrink-0 text-brand-warm" />
                <p className="text-[0.9rem] leading-relaxed text-dim">
                  <strong className="text-fg">O relógio no pulso.</strong> É onde ele é melhor: a
                  dica acende só para quem está usando, e a mesa segue a conversa sem perceber que
                  houve ajuda.
                </p>
              </li>
            </ul>

            <a
              href="/experience#baixar"
              className="mt-5 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-primary"
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

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <a
        href="/experience"
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.82rem] font-medium text-dim transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        voltar
      </a>
      <div className="mt-10">{children}</div>
    </main>
  )
}
