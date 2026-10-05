'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { motionDelay } from '../deck/motion'
import { AiSummary } from './ai-summary'
import { FEED, LIFE_MAP, PATIENT, PERIOD_LABEL, PERIODS, WORDS, type Period } from './data'
import { Feed } from './feed'
import { KpiRow } from './kpi-row'
import { PracticeChart } from './practice-chart'
import { Sidebar } from './sidebar'
import { findWord, kpisFor, rowsFor, trendOf, withLive } from './stats'
import { StatusPill } from './status-pill'
import { TrendChart } from './trend-chart'
import { useLiveEvents } from './use-live-events'
import { WordAvatar } from './word-avatar'
import { WordsTable } from './words-table'
import './dashboard.css'

type Tab = 'trend' | 'words' | 'practice' | 'feed'

const TABS: Array<{ id: Tab; label: string; title: string; note: string }> = [
  { id: 'trend', label: 'Evolução', title: 'Pistas por palavra, por semana', note: 'Quanto mais baixo, menos pista a pessoa precisou. O que se espera é a linha descer.' },
  { id: 'words', label: 'Palavras', title: 'Palavra por palavra', note: 'Das que mais pedem pista para as que menos pedem. Clique numa palavra para ver a escada dela.' },
  { id: 'practice', label: 'Prática', title: 'Prática fora da sessão', note: 'Minutos por semana com o eilo no dia a dia, contra a meta da diretriz europeia (ESO).' },
  { id: 'feed', label: 'Agora', title: 'Agora', note: 'Do mais novo para o mais antigo.' }
]

const TAB_KEYS: Record<string, Tab> = { Digit1: 'trend', Digit2: 'words', Digit3: 'practice', Digit4: 'feed' }

const LIFE_MAP_WORDS = LIFE_MAP.map(id => WORDS.find(word => word.id === id)).filter(word => word !== undefined)

export function ClinicianDashboard() {
  const { events: live, connected } = useLiveEvents()
  const [period, setPeriod] = useState<Period>('week')
  const [tab, setTab] = useState<Tab>('trend')
  const [selected, setSelected] = useState(LIFE_MAP[0])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const next = TAB_KEYS[event.code]
      if (next) setTab(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const words = useMemo(() => withLive(WORDS, live), [live])
  const kpis = kpisFor(words, period)
  const rows = rowsFor(words, period)
  const trend = trendOf(words)
  const week = kpisFor(words, 'week')
  const liveResults = live.filter(event => event.kind !== 'block')
  const freshWords = new Set(liveResults.flatMap(event => findWord(WORDS, event.word)?.id ?? []))
  const current = TABS.find(item => item.id === tab) ?? TABS[0]

  const openWord = (id: string) => {
    setSelected(id)
    setTab('words')
  }

  return (
    <div className="clinician-dash rise" style={motionDelay(200)} onClick={event => event.stopPropagation()}>
      <Sidebar live={connected || live.length > 0} />

      <main className="cd-main">
        <header className="cd-head">
          <div className="cd-who">
            <img className="cd-avatar cd-avatar--xl" src={PATIENT.photo} alt="" />
            <div>
              <div className="cd-name">
                <h1>{PATIENT.name}</h1>
                <Pencil className="cd-pencil" />
              </div>
              <p className="cd-sub">
                Acompanhando há 8 semanas · {PATIENT.events + live.length * 2} eventos · último {live.length > 0 ? 'agora há pouco' : 'há 2 min'}
              </p>
            </div>
          </div>
          <div className="cd-head-right">
            <StatusPill live={connected} />
            <div className="cd-seg" role="radiogroup" aria-label="Período">
              {PERIODS.map(item => (
                <button key={item} type="button" role="radio" aria-checked={period === item} className={period === item ? 'on' : undefined} onClick={() => setPeriod(item)}>
                  {PERIOD_LABEL[item]}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="cd-lifemap">
          <span className="cd-lifemap-label">No mapa da vida dela</span>
          {LIFE_MAP_WORDS.map(word => (
            <button key={word.id} type="button" className="cd-lifemap-item" onClick={() => openWord(word.id)}>
              <WordAvatar word={word} round />
              {word.label}
            </button>
          ))}
        </div>

        <div className="cd-body">
          <div className="cd-col">
            <KpiRow kpis={kpis} rows={rows} period={period} />

            <section className="cd-panel cd-panel--grow">
              <header className="cd-panel-head">
                <div>
                  <h2>{current.title}</h2>
                  <p>{current.note}</p>
                </div>
                <div className="cd-seg cd-seg--sm" role="tablist">
                  {TABS.map(item => (
                    <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'on' : undefined} onClick={() => setTab(item.id)}>
                      {item.label}
                      {item.id === 'feed' && liveResults.length > 0 && <span className="cd-badge">{liveResults.length}</span>}
                    </button>
                  ))}
                </div>
              </header>
              <div className="cd-panel-body">
                {tab === 'trend' && <TrendChart trend={trend} />}
                {tab === 'words' && <WordsTable rows={rows} selected={selected} onSelect={setSelected} fresh={freshWords} period={period} />}
                {tab === 'practice' && <PracticeChart />}
                {tab === 'feed' && <Feed events={[...live, ...FEED]} onWord={openWord} />}
              </div>
            </section>
          </div>

          <AiSummary levelNow={week.levelNow} levelBefore={week.levelBefore} blocks={week.current.blocks} />
        </div>
      </main>
    </div>
  )
}
