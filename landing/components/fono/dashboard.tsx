'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Check, Lock, Pencil, WifiOff, X } from 'lucide-react'
import {
  DEFAULT_API_URL,
  fetchEvents,
  fetchSubjects,
  fetchSummary,
  resolveApiUrl,
  type AuditEvent,
  type SubjectRow,
  type Summary
} from './api'
import {
  PERIOD_LABEL,
  followingFor,
  freshTargets,
  inWindow,
  kpisFor,
  statsOf,
  suggestionsFor,
  windowFor,
  withSummaryTargets,
  wordRows,
  type Period
} from './derive'
import { AiAssistant, AiControls } from './ai-assist'
import { AssistantChat } from './assistant-chat'
import { EventFeed } from './event-feed'
import { demoSnapshot } from './mock'
import { formatAgo, formatSpan, plural } from './format'
import { DEMO_PATIENT_PHOTO, useNameIndex, type KnownWord } from './names'
import { KpiRow, Panel } from './panels'
import { usePatientNames } from './patients'
import { Avatar, Sidebar } from './sidebar'
import { TrendChart } from './trend-chart'
import { useFreshKeys } from './use-fresh'
import { WordTable } from './word-table'

const POLL_MS = 3000
const EXAMPLE_HISTORY = [3.4, 3.3, 3.1, 2.9, 2.7, 2.5, 2.3, 2.1]
const PERIODS: Period[] = ['week', 'month', 'all']

type Status = 'connecting' | 'live' | 'paused' | 'offline' | 'demo'

interface Snapshot {
  subjects: SubjectRow[]
  subject: string | null
  summary: Summary | null
  events: AuditEvent[]
  receivedAt: number
}

function usePatientFeed() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [status, setStatus] = useState<Status>('connecting')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const chosen = useRef<string | null>(null)
  const poke = useRef<() => void>(() => {})
  const demo = useRef<Promise<Omit<Snapshot, 'receivedAt'>> | null>(null)

  useEffect(() => {
    const base = resolveApiUrl()
    let timer: number | undefined
    let controller: AbortController | undefined
    let stopped = false

    async function showDemo() {
      demo.current ??= demoSnapshot(Date.now())
      const snapshot = await demo.current
      if (stopped) return
      setSnapshot({ ...snapshot, receivedAt: Date.now() })
      setStatus('demo')
    }

    async function tick() {
      window.clearTimeout(timer)
      controller?.abort()
      const current = new AbortController()
      controller = current
      try {
        const subjects = await fetchSubjects(base, current.signal)
        if (subjects.length === 0) throw new Error('sem pacientes')
        const wanted = chosen.current
        const subject = subjects.some(row => row.subject === wanted)
          ? wanted
          : (subjects[0]?.subject ?? null)
        const [summary, events] = subject
          ? await Promise.all([
              fetchSummary(base, subject, current.signal),
              fetchEvents(base, subject, current.signal)
            ])
          : [null, []]
        if (stopped || current.signal.aborted) return
        setSnapshot({ subjects, subject, summary, events, receivedAt: Date.now() })
        setStatus(document.hidden ? 'paused' : 'live')
      } catch {
        if (stopped || current.signal.aborted) return
        setApiUrl(base)
        await showDemo()
      }
      if (!document.hidden) timer = window.setTimeout(tick, POLL_MS)
    }

    function onVisibility() {
      if (document.hidden) {
        window.clearTimeout(timer)
        setStatus(previous => (previous === 'live' ? 'paused' : previous))
      } else {
        void tick()
      }
    }

    poke.current = () => void tick()
    void tick()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stopped = true
      window.clearTimeout(timer)
      controller?.abort()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const choose = useCallback((subject: string) => {
    chosen.current = subject
    setSnapshot(previous =>
      previous ? { ...previous, subject, summary: null, events: [] } : previous
    )
    poke.current()
  }, [])

  return { snapshot, status, apiUrl, choose }
}

export function FonoDashboard() {
  const { snapshot, status, apiUrl, choose } = usePatientFeed()
  const names = useNameIndex()
  const [period, setPeriod] = useState<Period>('week')

  const subject = snapshot?.subject ?? null
  const events = useMemo(() => snapshot?.events ?? [], [snapshot])
  const demoSubject =
    subject != null &&
    subject === snapshot?.subjects[0]?.subject &&
    events.some(event => names.has(event.targetId))
      ? subject
      : null
  const patients = usePatientNames(snapshot?.subjects, demoSubject)
  const photoOf = (candidate: string) => (candidate === demoSubject ? DEMO_PATIENT_PHOTO : undefined)
  const fresh = useFreshKeys(events, subject)

  return (
    <div className="min-h-dvh bg-[#f6f5fb] text-[#1b1a22] lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <Sidebar
        subjects={snapshot?.subjects ?? []}
        selected={subject}
        nameOf={patients.nameOf}
        photoOf={photoOf}
        onSelect={choose}
        loading={!snapshot && status !== 'offline'}
        now={snapshot?.receivedAt ?? 0}
      />

      <main className="min-w-0 px-4 pt-5 pb-10 sm:px-6 lg:px-8 lg:pt-7">
        {status === 'offline' && snapshot && (
          <p
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-xl border border-[#f3d3dc] bg-[#fbeef2] px-4 py-2.5 text-[0.84rem] text-[#8a3a55]"
          >
            <WifiOff className="size-4 shrink-0" />
            Sem conexão com o servidor. Mostrando o último dado recebido; a página tenta de novo
            sozinha.
          </p>
        )}

        {!snapshot ? (
          status === 'offline' ? (
            <Offline apiUrl={apiUrl} />
          ) : (
            <Loading />
          )
        ) : snapshot.subjects.length === 0 || !subject ? (
          <Empty status={status} />
        ) : (
          <Patient
            key={subject}
            subject={subject}
            row={snapshot.subjects.find(item => item.subject === subject)}
            name={patients.nameOf(subject)}
            photo={photoOf(subject)}
            onRename={name => patients.rename(subject, name)}
            summary={snapshot.summary}
            events={events}
            names={names}
            fresh={fresh}
            status={status}
            period={period}
            onPeriod={setPeriod}
            now={snapshot.receivedAt}
          />
        )}

        <p className="mx-auto mt-10 flex max-w-[44rem] items-start justify-center gap-2 text-center text-[0.76rem] leading-relaxed text-[#8d8a9c]">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          <span>
            O servidor só recebe códigos opacos. Os nomes das palavras são resolvidos neste
            navegador e nunca saíram do aparelho do paciente nem da tela do fono. Os nomes dos
            pacientes ficam só neste computador.
          </span>
        </p>
      </main>
    </div>
  )
}

function Patient({
  subject,
  row,
  name,
  photo,
  onRename,
  summary,
  events,
  names,
  fresh,
  status,
  period,
  onPeriod,
  now
}: {
  subject: string
  row: SubjectRow | undefined
  name: string
  photo: string | undefined
  onRename: (name: string) => void
  summary: Summary | null
  events: AuditEvent[]
  names: ReturnType<typeof useNameIndex>
  fresh: Set<string>
  status: Status
  period: Period
  onPeriod: (period: Period) => void
  now: number
}) {
  const [exampleChoice, setExampleChoice] = useState<boolean | null>(null)
  const liveWeeks = summary?.trend.length ?? 0
  const showExample = exampleChoice ?? liveWeeks < 3

  const { from } = windowFor(period, now)
  const kpis = kpisFor(events, summary, period, now)
  const periodWords = wordRows(events, from)
  const words = period === 'all' ? withSummaryTargets(periodWords, summary) : periodWords
  const hot = freshTargets(events, fresh)

  const week = windowFor('week', now)
  const weekStats = statsOf(inWindow(events, week.from))
  const previousWeekEvents = inWindow(events, week.previousFrom ?? 0, week.from)
  const weekKpis = kpisFor(events, summary, 'week', now)
  const monthWords = wordRows(events, windowFor('month', now).from)
  const suggestions = suggestionsFor(
    monthWords,
    weekKpis,
    weekStats,
    previousWeekEvents.length > 0 ? statsOf(previousWeekEvents) : null,
    targetId => names.get(targetId)?.label ?? null
  )

  const loadingPatient = summary == null && events.length === 0

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-5">
      <PatientHeader
        subject={subject}
        name={name}
        photo={photo}
        lifeMap={photo ? [...names.values()].filter(word => word.photo && word.photo !== photo) : []}
        onRename={onRename}
        following={events.length > 0 ? formatSpan(followingFor(events, summary, now)) : null}
        lastSeen={row?.lastSeen ?? null}
        now={now}
        eventCount={row?.events ?? 0}
        status={status}
        period={period}
        onPeriod={onPeriod}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className={`flex min-w-0 flex-col gap-5 ${loadingPatient ? 'opacity-60' : ''}`}>
          <KpiRow kpis={kpis} words={words} periodLabel={PERIOD_LABEL[period]} />

          <Panel
            title="Degrau médio por semana"
            note="Quanto mais baixo, menos pista a pessoa precisou. O que se espera é a linha descer."
            action={
              <button
                type="button"
                aria-pressed={showExample}
                onClick={() => setExampleChoice(!showExample)}
                className="inline-flex items-center gap-2 rounded-full border border-[#e6e3ef] bg-white px-3 py-1.5 text-[0.74rem] font-semibold text-[#57546a] transition-colors outline-none hover:border-[#d9d3f5] hover:bg-[#faf9fd] focus-visible:ring-2 focus-visible:ring-[#8e7ff0]"
              >
                <span
                  className={`relative h-3.5 w-6 rounded-full transition-colors ${showExample ? 'bg-[#8e7ff0]' : 'bg-[#dcd9e6]'}`}
                >
                  <span
                    className={`absolute top-0.5 size-2.5 rounded-full bg-white transition-[left] ${showExample ? 'left-3' : 'left-0.5'}`}
                  />
                </span>
                Histórico de exemplo
              </button>
            }
          >
            <div className="flex flex-wrap gap-x-5 gap-y-1 px-5 text-[0.74rem] text-[#6a6779]">
              {showExample && (
                <span className="inline-flex items-center gap-2">
                  <svg width="22" height="8" aria-hidden="true">
                    <line
                      x1="1"
                      x2="21"
                      y1="4"
                      y2="4"
                      stroke="#a19db3"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  exemplo ilustrativo, não é dado real
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <svg width="22" height="8" aria-hidden="true">
                  <line x1="1" x2="21" y1="4" y2="4" stroke="#6b5fa8" strokeWidth="2.5" />
                  <circle cx="11" cy="4" r="3.5" fill="#6b5fa8" />
                </svg>
                ao vivo, vindo do app
                {liveWeeks > 0 && ` · ${plural(liveWeeks, 'semana', 'semanas')}`}
              </span>
            </div>
            <div className="px-3 pt-1 pb-3 sm:px-4">
              <TrendChart
                example={EXAMPLE_HISTORY}
                live={summary?.trend ?? []}
                showExample={showExample}
              />
            </div>
          </Panel>

          <Panel
            title="Palavra por palavra"
            note={`${PERIOD_LABEL[period]}: das que mais pedem pista para as que menos pedem.`}
          >
            <WordTable rows={words} names={names} freshTargets={hot} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <AiAssistant
            name={name}
            kpis={weekKpis}
            week={weekStats}
            suggestions={suggestions}
            events={inWindow(events, week.from)}
          />

          <Panel
            title="Agora"
            note="Do mais novo para o mais antigo."
            action={<StatusPill status={status} compact />}
          >
            <div className="max-h-[26rem] overflow-y-auto px-3 pb-3">
              <EventFeed events={events} names={names} fresh={fresh} />
            </div>
          </Panel>

          <AiControls />
        </div>
      </div>

      <AssistantChat
        patient={name}
        names={names}
        week={weekStats}
        previousWeek={previousWeekEvents.length > 0 ? statsOf(previousWeekEvents) : null}
        weeklyLevels={summary?.trend.map(point => point.averageLevel) ?? []}
        words={monthWords}
        weekEvents={inWindow(events, week.from)}
      />
    </div>
  )
}

function PatientHeader({
  subject,
  name,
  photo,
  lifeMap,
  onRename,
  following,
  lastSeen,
  eventCount,
  status,
  period,
  onPeriod,
  now
}: {
  subject: string
  name: string
  photo: string | undefined
  lifeMap: KnownWord[]
  onRename: (name: string) => void
  following: string | null
  lastSeen: string | null
  eventCount: number
  status: Status
  period: Period
  onPeriod: (period: Period) => void
  now: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) input.current?.select()
  }, [editing])

  function start() {
    setDraft(name)
    setEditing(true)
  }

  function commit() {
    onRename(draft)
    setEditing(false)
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') commit()
    if (event.key === 'Escape') setEditing(false)
  }

  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar subject={subject} name={name} photo={photo} size={photo ? 'xl' : 'lg'} />
        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={input}
                value={draft}
                maxLength={40}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={onKey}
                onBlur={commit}
                aria-label="Nome do paciente"
                placeholder="Nome do paciente"
                className="w-[14rem] max-w-full rounded-lg border border-[#d9d3f5] bg-white px-2.5 py-1 text-[1.35rem] font-bold tracking-[-0.025em] outline-none focus:ring-2 focus:ring-[#8e7ff0]"
              />
              <button
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={commit}
                aria-label="Salvar nome"
                className="grid size-8 place-items-center rounded-lg text-[#2f6b52] hover:bg-[#e3f3ec]"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => setEditing(false)}
                aria-label="Cancelar"
                className="grid size-8 place-items-center rounded-lg text-[#6a6779] hover:bg-[#f1eff6]"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="group flex min-w-0 items-center gap-1.5">
              <h1 className="truncate text-[1.5rem] leading-tight font-bold tracking-[-0.03em]">
                {name}
              </h1>
              <button
                type="button"
                onClick={start}
                aria-label={`Renomear ${name}`}
                title="Renomear (fica só neste computador)"
                className="grid size-7 shrink-0 place-items-center rounded-lg text-[#a3a0b2] transition-colors outline-none group-hover:text-[#6b5fa8] hover:bg-[#f1eefb] focus-visible:ring-2 focus-visible:ring-[#8e7ff0]"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          )}
          <p className="mt-0.5 truncate text-[0.82rem] text-[#6a6779]">
            {following ? `Acompanhando ${following}` : 'Sem eventos ainda'}
            {' · '}
            {plural(eventCount, 'evento', 'eventos')}
            {lastSeen && (
              <span className="hidden sm:inline"> · último {formatAgo(lastSeen, now)}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <StatusPill status={status} />
        <div
          role="radiogroup"
          aria-label="Período"
          className="inline-flex rounded-xl border border-[#e6e3ef] bg-white p-1"
        >
          {PERIODS.map(item => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={period === item}
              onClick={() => onPeriod(item)}
              className={`rounded-lg px-3 py-1.5 text-[0.8rem] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8e7ff0] ${
                period === item
                  ? 'bg-[#433d56] text-white'
                  : 'text-[#57546a] hover:bg-[#f6f5fb] hover:text-[#1b1a22]'
              }`}
            >
              {PERIOD_LABEL[item]}
            </button>
          ))}
        </div>
      </div>
      </div>
      {lifeMap.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#e6e3ef] pt-4">
          <span className="text-[0.78rem] text-[#6a6779]">No mapa da vida dela</span>
          {lifeMap.map(word => (
            <span key={word.label} className="flex items-center gap-2">
              <img src={word.photo} alt="" className="size-8 rounded-full object-cover" />
              <span className="text-[0.86rem] font-medium text-[#1b1a22]">{word.label}</span>
            </span>
          ))}
        </div>
      )}
    </header>
  )
}

const STATUS_LOOK: Record<Status, { dot: string; text: string; style: string }> = {
  connecting: {
    dot: 'bg-[#c9c7d3]',
    text: 'conectando',
    style: 'bg-white text-[#6a6779] border-[#e6e3ef]'
  },
  demo: {
    dot: 'bg-[#8e7ff0] v3-live-dot',
    text: 'demonstração',
    style: 'bg-[#f3f0fd] text-[#5a4f98] border-[#e4dcfb]'
  },
  live: {
    dot: 'bg-[#3fae7a] v3-live-dot',
    text: 'ao vivo',
    style: 'bg-[#eef8f2] text-[#2f6b52] border-[#d3eadc]'
  },
  paused: {
    dot: 'bg-[#d9a93f]',
    text: 'pausado',
    style: 'bg-[#fbf5e6] text-[#7a5a14] border-[#f0e3c0]'
  },
  offline: {
    dot: 'bg-[#e0708f]',
    text: 'sem conexão',
    style: 'bg-[#fbeef2] text-[#8a3a55] border-[#f3d3dc]'
  }
}

function StatusPill({ status, compact = false }: { status: Status; compact?: boolean }) {
  const look = STATUS_LOOK[status]
  return (
    <span
      role={compact ? undefined : 'status'}
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${look.style} ${
        compact ? 'px-2.5 py-0.5 text-[0.7rem]' : 'px-3 py-1.5 text-[0.78rem]'
      }`}
    >
      <span className={`size-2 rounded-full ${look.dot}`} />
      {look.text}
    </span>
  )
}

function Empty({ status }: { status: Status }) {
  return (
    <div className="mx-auto grid max-w-[40rem] place-items-center rounded-2xl border border-[#e6e3ef] bg-white px-6 py-16 text-center lg:mt-16">
      <span className="grid size-14 place-items-center rounded-full bg-[#e4e0fb]">
        <span className="size-3 rounded-full bg-[#8e7ff0] v3-live-dot" />
      </span>
      <h1 className="mt-6 text-[1.3rem] font-bold tracking-[-0.025em]">Nenhum paciente ainda</h1>
      <p className="mt-2 max-w-[26rem] text-[0.92rem] leading-relaxed text-[#6a6779]">
        Abra o app e trave numa palavra: o evento aparece aqui em segundos.
      </p>
      <div className="mt-5">
        <StatusPill status={status} />
      </div>
    </div>
  )
}

function Offline({ apiUrl }: { apiUrl: string }) {
  return (
    <div className="mx-auto grid max-w-[40rem] place-items-center rounded-2xl border border-[#e6e3ef] bg-white px-6 py-16 text-center lg:mt-16">
      <span className="grid size-14 place-items-center rounded-full bg-[#fbeef2] text-[#b04a6e]">
        <WifiOff className="size-6" />
      </span>
      <h1 className="mt-6 text-[1.3rem] font-bold tracking-[-0.025em]">
        Não conseguimos falar com o servidor
      </h1>
      <p className="mt-2 max-w-[28rem] text-[0.92rem] leading-relaxed text-[#6a6779]">
        Confira se a API do eilo está rodando em{' '}
        <code className="rounded bg-[#f3f1f8] px-1.5 py-0.5 font-mono text-[0.82rem] break-all text-[#1b1a22]">
          {apiUrl}
        </code>
        . A página tenta de novo sozinha a cada 3 segundos.
      </p>
    </div>
  )
}

function Loading() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-5" aria-busy="true">
      <div className="flex items-center gap-3.5">
        <span className="size-12 animate-pulse rounded-full bg-[#ebe8f3]" />
        <span className="h-7 w-48 animate-pulse rounded-lg bg-[#ebe8f3]" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map(key => (
              <span key={key} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <span className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
        <span className="h-[30rem] animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  )
}
