import { KIND_LABEL, STATE_LABEL, type Period } from './data'
import { formatLevel, type Row } from './stats'
import { WordAvatar } from './word-avatar'
import { WordDetail } from './word-detail'

const MAX_LEVEL = 4
const SPARK = { width: 76, height: 26, pad: 3 }

function Sparkline({ levels }: { levels: number[] }) {
  const step = (SPARK.width - SPARK.pad * 2) / (levels.length - 1)
  const points = levels.map((level, index) => ({
    x: SPARK.pad + step * index,
    y: SPARK.pad + (SPARK.height - SPARK.pad * 2) * (1 - Math.min(level, MAX_LEVEL) / MAX_LEVEL)
  }))
  const last = points[points.length - 1]
  const falling = levels[levels.length - 1] < levels[0]
  return (
    <svg width={SPARK.width} height={SPARK.height} className="cd-spark" aria-hidden="true">
      <line x1={0} x2={SPARK.width} y1={SPARK.pad} y2={SPARK.pad} stroke="#f1eff6" />
      <line x1={0} x2={SPARK.width} y1={SPARK.height - SPARK.pad} y2={SPARK.height - SPARK.pad} stroke="#f1eff6" />
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#b9a3f7" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={2.75} fill={falling ? '#2f6b52' : '#6b5fa8'} />
    </svg>
  )
}

type WordsTableProps = { rows: Row[]; selected: string; onSelect: (id: string) => void; fresh: Set<string>; period: Period }

export function WordsTable({ rows, selected, onSelect, fresh, period }: WordsTableProps) {
  const chosen = rows.find(row => row.word.id === selected) ?? rows[0]
  return (
    <div className="cd-words">
      <table className="cd-table">
        <thead>
          <tr>
            <th>Palavra</th>
            <th className="num">Vezes</th>
            <th>Degrau médio</th>
            <th>Evolução</th>
            <th className="end">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.word.id} className={`${row.word.id === chosen.word.id ? 'on' : ''}${fresh.has(row.word.id) ? ' fresh' : ''}`} onClick={() => onSelect(row.word.id)}>
              <td>
                <span className="cd-word">
                  <WordAvatar word={row.word} />
                  <span>
                    <b>{row.word.label}</b>
                    <small>{KIND_LABEL[row.word.kind]}</small>
                  </span>
                </span>
              </td>
              <td className="num">
                {row.attempts}
                {row.abandoned > 0 && <small>+{row.abandoned} sem sair</small>}
              </td>
              <td>
                <span className="cd-level">
                  <b>{formatLevel(row.average)}</b>
                  <span className="cd-bar"><i style={{ width: `${(row.average / MAX_LEVEL) * 100}%` }} /></span>
                </span>
              </td>
              <td><Sparkline levels={row.word.levels} /></td>
              <td className="end">
                <span className={`cd-state cd-state--${row.state}`}><i />{STATE_LABEL[row.state]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <WordDetail row={chosen} period={period} />
    </div>
  )
}
