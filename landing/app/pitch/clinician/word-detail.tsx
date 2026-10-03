import { BuddyMark } from './buddy-mark'
import { KIND_LABEL, PERIOD_SPAN, WEEKS, type Period } from './data'
import { formatLevel, type Row } from './stats'
import { WordAvatar } from './word-avatar'

const MAX_LEVEL = 4
const UNAIDED_LEVEL = 0.5

export function WordDetail({ row, period }: { row: Row; period: Period }) {
  const { word } = row
  const now = Math.round(word.levels[WEEKS - 1])
  return (
    <aside className="cd-detail" key={word.id}>
      <div className="cd-detail-head">
        <WordAvatar word={word} size={52} />
        <div>
          <h3>{word.label}{word.alias && <small> · “{word.alias}”</small>}</h3>
          <p>{KIND_LABEL[word.kind]} · {row.attempts} {row.attempts === 1 ? 'vez' : 'vezes'} {PERIOD_SPAN[period]}</p>
        </div>
      </div>

      <p className="cd-caps cd-caps--in">A escada dela</p>
      <ol className="cd-rungs">
        <li className={now === 0 ? 'on' : undefined}><span>0</span>sozinha, sem pista</li>
        {word.rungs.map((text, index) => (
          <li key={text} className={now === index + 1 ? 'on' : undefined}>
            <span>{index + 1}</span>
            {text}
          </li>
        ))}
      </ol>

      <p className="cd-caps cd-caps--in">Pista em que saiu, semana a semana</p>
      <div className="cd-weeks">
        {word.levels.map((level, index) => (
          <div key={index} className="cd-week">
            <span className="cd-week-bar"><i style={{ height: `${Math.max(6, (level / MAX_LEVEL) * 100)}%` }} className={level <= UNAIDED_LEVEL ? 'zero' : undefined} /></span>
            <b>{formatLevel(level)}</b>
            <small>S{index + 1}</small>
          </div>
        ))}
      </div>

      <p className="cd-detail-tip">
        <BuddyMark size={24} />
        <span>{word.tip}</span>
      </p>
    </aside>
  )
}
