import type { ReactNode } from 'react'
import type { AuditEvent } from './api'
import { eventKey } from './derive'
import { CHANNEL_LABEL, ORIGIN_LABEL, formatClock, formatDay, formatSeconds } from './format'
import { PROTECTED_WORD, type NameIndex } from './names'

const MAX_ROWS = 40

const DOT: Record<AuditEvent['event'], string> = {
  block: 'bg-[#efb6ec] ring-[#fbe7f9]',
  step: 'bg-[#b9a3f7] ring-[#efe9fb]',
  resolved: 'bg-[#6b5fa8] ring-[#e4e0fb]',
  abandoned: 'bg-[#c9c5d6] ring-[#f1eff6]'
}

function Word({ children, known }: { children: ReactNode; known: boolean }) {
  return known ? (
    <b className="font-semibold text-[#1b1a22]">{children}</b>
  ) : (
    <span className="text-[#6a6779] italic">{children}</span>
  )
}

function describe(event: AuditEvent, word: string | undefined): ReactNode {
  const label = <Word known={Boolean(word)}>{word ?? PROTECTED_WORD}</Word>
  switch (event.event) {
    case 'block':
      return <>Travou em {label}</>
    case 'step':
      return (
        <>
          Subiu para a pista {event.level}
          <span className="ml-1.5 text-[0.74rem] text-[#8d8a9c]">· {ORIGIN_LABEL[event.origin]}</span>
        </>
      )
    case 'resolved':
      return event.level === 0 ? (
        <>
          Disse {label} sozinha · <span className="tabular">{formatSeconds(event.elapsedMs)}</span>
        </>
      ) : (
        <>
          Disse {label} na pista {event.level} ·{' '}
          <span className="tabular">{formatSeconds(event.elapsedMs)}</span>
        </>
      )
    case 'abandoned':
      return (
        <>
          A conversa seguiu sem {label} (pista {event.level})
        </>
      )
  }
}

export function EventFeed({
  events,
  names,
  fresh
}: {
  events: AuditEvent[]
  names: NameIndex
  fresh: Set<string>
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#e6e3ef] px-4 py-7 text-center text-[0.84rem] leading-relaxed text-[#6a6779]">
        Nenhum evento ainda. Quando a palavra travar no app, a linha aparece aqui.
      </p>
    )
  }

  const rows = events.slice(0, MAX_ROWS)
  const now = new Date()

  return (
    <ol aria-live="polite" aria-relevant="additions">
      {rows.map((event, index) => {
        const key = eventKey(event)
        const channel = CHANNEL_LABEL[event.channel]
        const day = formatDay(event.occurredAt, now)
        const startsDay = index === 0 || formatDay(rows[index - 1].occurredAt, now) !== day
        return (
          <li key={key}>
            {startsDay && (
              <p className="sticky top-0 z-[1] bg-white px-2 pt-3 pb-1 text-[0.66rem] font-bold tracking-[0.12em] text-[#8d8a9c] uppercase">
                {day}
              </p>
            )}
            <div
              className={`grid grid-cols-[2.75rem_1.5rem_1fr] items-start gap-2 rounded-lg px-2 py-2 transition-colors duration-[1200ms] ${
                fresh.has(key) ? 'bg-[#efe9fb]' : 'hover:bg-[#f8f7fc]'
              }`}
            >
              <time
                dateTime={event.occurredAt}
                className="tabular pt-px font-mono text-[0.72rem] text-[#8d8a9c]"
              >
                {formatClock(event.occurredAt)}
              </time>
              {names.get(event.targetId)?.photo ? (
                <img
                  src={names.get(event.targetId)?.photo}
                  alt=""
                  className={`size-6 rounded-full object-cover ring-2 ${event.event === 'resolved' ? 'ring-[#cfe8da]' : 'ring-[#f1eff6]'}`}
                />
              ) : (
                <span className={`mt-[0.35rem] size-2 rounded-full ring-4 ${DOT[event.event]}`} />
              )}
              <div className="min-w-0 text-[0.84rem] leading-snug break-words text-[#57546a]">
                {describe(event, names.get(event.targetId)?.label)}
                {channel && event.event !== 'step' && (
                  <span className="ml-1.5 text-[0.72rem] text-[#8d8a9c]">no {channel}</span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
