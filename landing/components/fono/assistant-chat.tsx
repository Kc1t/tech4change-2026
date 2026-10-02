'use client'

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowUp, Lock, X } from 'lucide-react'
import { BuddyMark } from './ai-assist'
import { resolveApiUrl, type AuditEvent, type EventOrigin } from './api'
import type { PeriodStats, WordRow } from './derive'
import { PROTECTED_WORD, type NameIndex } from './names'

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = [
  'Como foi a semana?',
  'Qual palavra pede mais ajuda?',
  'O que levar para a próxima sessão?',
  'A IA está acertando a ordem das pistas?'
]

const OPAQUE = /\[?(n_[a-f0-9]{6})\]?/g

function fold(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function anonymise(question: string, names: NameIndex, patient: string) {
  let folded = fold(question)
  if (patient.trim()) {
    folded = folded.replace(new RegExp(`\\b${escapeRegExp(fold(patient.trim()))}\\b`, 'g'), 'a paciente')
  }
  const labels = [...names.entries()].sort((a, b) => b[1].label.length - a[1].label.length)
  for (const [id, word] of labels) {
    folded = folded.replace(new RegExp(`\\b${escapeRegExp(fold(word.label))}\\b`, 'g'), `[${id}]`)
  }
  return folded
}

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

function localAnswer(
  question: string,
  week: PeriodStats,
  previousWeek: PeriodStats | null,
  words: WordRow[],
  weekEvents: AuditEvent[]
) {
  const asked = question.match(/\[(n_[a-f0-9]{6})\]/)?.[1]
  const ranked = [...words].filter(row => row.attempts > 0).sort((a, b) => b.averageLevel - a.averageLevel)

  if (asked) {
    const row = words.find(item => item.targetId === asked)
    if (!row) return `Ainda não há registro de [${asked}] neste período.`
    const recent = row.levels.slice(-4).join(', ')
    return `[${asked}] travou ${row.attempts} vezes e precisou, em média, de ${decimal.format(row.averageLevel)} pistas. Nas últimas vezes: ${recent}. ${row.levels.at(-1)! < row.levels[0] ? 'Está saindo com menos ajuda.' : 'Ainda pede a mesma ajuda; vale olhar em sessão.'}`
  }

  if (/\b(ia|ordem|acert|modelo)/.test(question)) {
    const blocks = weekEvents.filter(event => event.event === 'block')
    const byModel = blocks.filter(event => event.origin !== 'deterministic').length
    return blocks.length === 0
      ? 'Nenhum travamento nesta semana ainda.'
      : `${byModel} de ${blocks.length} escadas desta semana foram ordenadas pela IA; as outras ${blocks.length - byModel} usaram a escada pronta do aparelho. A IA só recebe códigos, nunca os nomes.`
  }

  if (/(sessao|levar|trabalhar|proxima)/.test(question) && ranked.length > 0) {
    const hardest = ranked[0]
    const easiest = ranked.at(-1)!
    return `Eu levaria [${hardest.targetId}], que ainda pede ${decimal.format(hardest.averageLevel)} pistas em média. E vale contar à paciente que [${easiest.targetId}] já sai com ${decimal.format(easiest.averageLevel)}. A decisão é sua.`
  }

  if (/(palavra|ajuda|dificil|preocupa|pior)/.test(question) && ranked.length > 0) {
    const hardest = ranked[0]
    return `[${hardest.targetId}] é a que mais pede ajuda: ${decimal.format(hardest.averageLevel)} pistas em média, em ${hardest.attempts} vezes. ${ranked.length > 1 ? `A mais leve é [${ranked.at(-1)!.targetId}].` : ''}`
  }

  if (week.blocks === 0) return 'Ainda não houve travamento nesta semana.'
  const now = week.averageLevel
  const before = previousWeek?.averageLevel
  const trend =
    now != null && before != null
      ? now < before - 0.2
        ? ` É menos que na semana anterior (${decimal.format(before)}): a palavra está voltando mais cedo.`
        : now > before + 0.2
          ? ` Subiu em relação à semana anterior (${decimal.format(before)}).`
          : ' Ficou parecido com a semana anterior.'
      : ''
  return `Nesta semana foram ${week.blocks} travamentos fora da sessão${now != null ? `, com ${decimal.format(now)} pistas em média até a palavra sair` : ''}.${trend}`
}

function statsFor(stats: PeriodStats | null) {
  if (!stats) return null
  return {
    blocks: stats.blocks,
    resolved: stats.resolved,
    abandoned: stats.abandoned,
    averageLevel: stats.averageLevel == null ? null : Math.round(stats.averageLevel * 100) / 100,
    averageElapsedMs: stats.averageElapsed == null ? null : Math.round(stats.averageElapsed)
  }
}

function Answer({ text, names }: { text: string; names: NameIndex }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(OPAQUE)) {
    const index = match.index ?? 0
    parts.push(text.slice(last, index))
    const word = names.get(match[1])
    parts.push(
      <b key={index} className={word ? 'font-semibold text-[#1b1a22]' : 'font-normal italic'}>
        {word?.label ?? PROTECTED_WORD}
      </b>
    )
    last = index + match[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

export function AssistantChat({
  patient,
  names,
  week,
  previousWeek,
  weeklyLevels,
  words,
  weekEvents
}: {
  patient: string
  names: NameIndex
  week: PeriodStats
  previousWeek: PeriodStats | null
  weeklyLevels: number[]
  words: WordRow[]
  weekEvents: AuditEvent[]
}) {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [turns, thinking])

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  async function send(question: string) {
    const text = question.trim()
    if (!text || thinking) return
    const history = turns.slice(-6)
    setTurns(previous => [...previous, { role: 'user', text }])
    setDraft('')
    setThinking(true)

    const ladders: Record<EventOrigin, number> = { model: 0, cache: 0, deterministic: 0 }
    for (const event of weekEvents) if (event.event === 'block') ladders[event.origin] += 1

    try {
      const response = await fetch(`${resolveApiUrl()}/v1/clinician/ask`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: anonymise(text, names, patient),
          history: history.map(turn => ({
            role: turn.role,
            text: turn.role === 'user' ? anonymise(turn.text, names, patient) : turn.text
          })),
          context: {
            week: statsFor(week),
            previousWeek: statsFor(previousWeek),
            weeklyLevels: weeklyLevels.map(level => Math.round(level * 100) / 100),
            words: words.slice(0, 40).map(row => ({
              id: row.targetId,
              kind: names.get(row.targetId)?.kind ?? null,
              attempts: row.attempts,
              averageLevel: Math.round(row.averageLevel * 100) / 100,
              state: row.state,
              recentLevels: row.levels.slice(-12),
              abandoned: row.abandoned
            })),
            ladders
          }
        })
      })
      if (!response.ok) throw new Error(String(response.status))
      const body = (await response.json()) as { answer: string }
      setTurns(previous => [...previous, { role: 'assistant', text: body.answer }])
    } catch {
      const answer = localAnswer(anonymise(text, names, patient), week, previousWeek, words, weekEvents)
      await new Promise(resolve => window.setTimeout(resolve, 500 + answer.length * 6))
      setTurns(previous => [...previous, { role: 'assistant', text: answer }])
    } finally {
      setThinking(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void send(draft)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <section
          role="dialog"
          aria-label="Pergunte ao eilo"
          className="v3-bubble-in flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#e6e3ef] bg-white shadow-[0_30px_70px_-30px_rgba(60,45,110,0.55)]"
        >
          <header className="flex items-center gap-3 border-b border-[#efedf5] px-4 py-3.5">
            <BuddyMark size={32} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[0.95rem] font-semibold tracking-[-0.015em]">Pergunte ao eilo</h2>
              <p className="text-[0.74rem] text-[#8d8a9c]">Responde com os dados de {patient}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="grid size-8 place-items-center rounded-lg text-[#6a6779] transition-colors hover:bg-[#f3f1f8]"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex gap-2.5">
              <BuddyMark size={24} className="mt-0.5" />
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-2.5 text-[0.87rem] leading-relaxed text-[#3a3846]">
                Oi! Posso te ajudar a ler a semana de {patient}. Pergunte o que quiser sobre os dados.
              </p>
            </div>

            {turns.length === 0 && (
              <div className="flex flex-wrap gap-1.5 pl-[2.1rem]">
                {SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-full border border-[#e6e3ef] px-3 py-1.5 text-[0.78rem] text-[#433d56] transition-colors hover:border-[#d9d3f5] hover:bg-[#faf9fd]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <p
                  key={index}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#433d56] px-3.5 py-2.5 text-[0.87rem] leading-relaxed text-white"
                >
                  {turn.text}
                </p>
              ) : (
                <div key={index} className="flex gap-2.5">
                  <BuddyMark size={24} className="mt-0.5" />
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-2.5 text-[0.87rem] leading-relaxed whitespace-pre-line text-[#3a3846]">
                    <Answer text={turn.text} names={names} />
                  </p>
                </div>
              )
            )}

            {thinking && (
              <div className="flex gap-2.5">
                <BuddyMark size={24} className="mt-0.5" />
                <p className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-3" aria-label="Pensando">
                  {[0, 1, 2].map(dot => (
                    <span
                      key={dot}
                      className="v3-live-dot size-1.5 rounded-full bg-[#8e7ff0]"
                      style={{ animationDelay: `${dot * 180}ms` }}
                    />
                  ))}
                </p>
              </div>
            )}

          </div>

          <form onSubmit={onSubmit} className="border-t border-[#efedf5] px-3 pt-3 pb-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-[#e6e3ef] bg-[#faf9fd] py-1.5 pr-1.5 pl-3.5 focus-within:border-[#d9d3f5]">
              <input
                ref={input}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                maxLength={400}
                placeholder="Pergunte sobre a semana…"
                aria-label="Sua pergunta"
                className="min-w-0 flex-1 bg-transparent text-[0.88rem] outline-none placeholder:text-[#a3a0b2]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="Enviar"
                className="grid size-8 place-items-center rounded-lg bg-[#433d56] text-white transition-opacity disabled:opacity-35"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.7rem] text-[#8d8a9c]">
              <Lock className="size-3" />
              A IA recebe só códigos e números, nunca nomes.
            </p>
          </form>
        </section>
      )}

      <div className="flex items-center gap-2.5">
        {!open && (
          <span className="hidden rounded-full border border-[#e6e3ef] bg-white px-3.5 py-2 text-[0.82rem] font-medium text-[#433d56] shadow-[0_10px_30px_-18px_rgba(60,45,110,0.5)] sm:block">
            Pergunte ao eilo
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-label={open ? 'Fechar o assistente' : 'Abrir o assistente'}
          aria-expanded={open}
          className="rounded-full ring-4 ring-white shadow-[0_16px_40px_-14px_rgba(80,60,150,0.7)] transition-transform hover:scale-105 active:scale-95"
        >
          <BuddyMark size={56} />
        </button>
      </div>
    </div>
  )
}
