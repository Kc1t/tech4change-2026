import type { ReactNode } from 'react'
import { CHANNEL_LABEL, DAY_LABEL, DAY_ORDER, ORIGIN_LABEL, WORDS, type FeedEvent } from './data'
import { findWord, formatLevel } from './stats'
import { WordAvatar } from './word-avatar'

function describe(event: FeedEvent, onWord: (id: string) => void): ReactNode {
  const word = findWord(WORDS, event.word)
  const label = word ? <button type="button" className="cd-link" onClick={() => onWord(word.id)}>{word.label}</button> : <b>{event.word}</b>
  const seconds = <span className="cd-tab">{formatLevel(event.seconds ?? 0)} s</span>
  switch (event.kind) {
    case 'block':
      return <>Travou em {label}</>
    case 'step':
      return <>Subiu para a pista {event.level}{event.origin && <span className="cd-faint"> · {ORIGIN_LABEL[event.origin]}</span>}</>
    case 'resolved':
      return event.level === 0
        ? <>Disse {label} sozinha · {seconds}</>
        : <>Disse {label} na pista {event.level} · {seconds}</>
    case 'given':
      return <>Recebeu {label} pronta (pista {event.level})</>
    case 'abandoned':
      return <>A conversa seguiu sem {label} (pista {event.level})</>
  }
}

export function Feed({ events, onWord }: { events: FeedEvent[]; onWord: (id: string) => void }) {
  return (
    <ol className="cd-feed">
      {DAY_ORDER.map(day => {
        const list = events.filter(event => event.day === day)
        if (list.length === 0) return null
        return (
          <li key={day}>
            <p className="cd-caps cd-caps--day">{DAY_LABEL[day]}</p>
            {list.map(event => {
              const word = findWord(WORDS, event.word)
              return (
                <div key={event.key} className={`cd-event${event.live ? ' fresh' : ''}`}>
                  <time className="cd-tab">{event.time}</time>
                  {word ? <WordAvatar word={word} round size={26} /> : <span className={`cd-event-dot cd-event-dot--${event.kind}`} />}
                  <p>
                    {describe(event, onWord)}
                    {event.channel && event.kind !== 'step' && <span className="cd-faint"> no {CHANNEL_LABEL[event.channel]}</span>}
                  </p>
                </div>
              )
            })}
          </li>
        )
      })}
    </ol>
  )
}
