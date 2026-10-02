import type { TargetState } from './api'
import type { WordRow } from './derive'
import { KIND_LABEL, STATE_LABEL, formatLevel } from './format'
import { PROTECTED_WORD, type NameIndex } from './names'

const MAX_LEVEL = 4

const STATE_DOT: Record<TargetState, string> = {
  unaided: 'bg-[#4f9c74]',
  one_rung: 'bg-[#8e7ff0]',
  full_ladder: 'bg-[#d0705a]'
}

function Sparkline({ levels }: { levels: number[] }) {
  const width = 72
  const height = 24
  if (levels.length === 0) return <span className="text-[0.72rem] text-[#a3a0b2]">—</span>
  const step = levels.length > 1 ? (width - 6) / (levels.length - 1) : 0
  const points = levels.map((level, index) => ({
    x: 3 + step * index + (levels.length === 1 ? (width - 6) / 2 : 0),
    y: 3 + (height - 6) * (1 - Math.min(level, MAX_LEVEL) / MAX_LEVEL)
  }))
  const last = points[points.length - 1]
  const falling = levels.length > 1 && levels[levels.length - 1] < levels[0]

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={`Pistas nas últimas vezes: ${levels.join(', ')}`}
      className="block overflow-visible"
    >
      <line x1={0} x2={width} y1={3} y2={3} stroke="#f1eff6" />
      <line x1={0} x2={width} y1={height - 3} y2={height - 3} stroke="#f1eff6" />
      {points.length > 1 && (
        <polyline
          points={points.map(point => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke="#b9a3f7"
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <circle cx={last.x} cy={last.y} r={2.75} fill={falling ? '#2f6b52' : '#6b5fa8'} />
    </svg>
  )
}

export function WordTable({
  rows,
  names,
  freshTargets
}: {
  rows: WordRow[]
  names: NameIndex
  freshTargets: Set<string>
}) {
  if (rows.length === 0) {
    return (
      <p className="mx-5 mb-5 rounded-xl border border-dashed border-[#e6e3ef] px-5 py-8 text-center text-[0.86rem] leading-relaxed text-[#6a6779]">
        Nenhuma palavra alcançada neste período.
      </p>
    )
  }

  return (
    <table className="w-full table-fixed border-collapse text-left text-[0.86rem]">
      <thead>
        <tr className="border-y border-[#efedf5] bg-[#faf9fd] text-[0.66rem] font-bold tracking-[0.1em] text-[#8d8a9c] uppercase">
          <th scope="col" className="py-2.5 pl-5 font-bold">
            Palavra
          </th>
          <th scope="col" className="hidden w-[6.5rem] py-2.5 text-right font-bold md:table-cell">
            Vezes
          </th>
          <th scope="col" className="w-[4rem] py-2.5 pl-3 font-bold sm:w-[10rem] sm:pl-5">
            Degrau médio
          </th>
          <th scope="col" className="hidden w-[6.5rem] py-2.5 pl-3 font-bold lg:table-cell">
            Evolução
          </th>
          <th scope="col" className="w-[7.5rem] py-2.5 pr-5 text-right font-bold sm:w-[9rem]">
            Estado
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const word = names.get(row.targetId)
          const fresh = freshTargets.has(row.targetId)
          return (
            <tr
              key={row.targetId}
              className={`border-b border-[#f1eff6] transition-colors duration-[1200ms] last:border-b-0 ${
                fresh ? 'bg-[#efe9fb]' : 'hover:bg-[#faf9fd]'
              }`}
            >
              <td className="py-3 pr-2 pl-5">
                <div className="flex min-w-0 items-center gap-3">
                  {word?.photo ? (
                    <img src={word.photo} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="size-10 shrink-0 rounded-xl bg-[#f1eff6]" />
                  )}
                  <span className="min-w-0">
                    <span
                      className={`block break-words ${word ? 'font-semibold text-[#1b1a22]' : 'text-[#6a6779] italic'}`}
                      title={word ? undefined : row.targetId}
                    >
                      {word?.label ?? PROTECTED_WORD}
                    </span>
                    {word && <span className="block text-[0.74rem] text-[#8d8a9c]">{KIND_LABEL[word.kind]}</span>}
                  </span>
                </div>
                <span className="tabular text-[0.72rem] text-[#8d8a9c] md:hidden">
                  {row.attempts} {row.attempts === 1 ? 'vez' : 'vezes'}
                </span>
              </td>
              <td className="tabular hidden py-3 text-right text-[#57546a] md:table-cell">
                {row.attempts}
                {row.abandoned > 0 && (
                  <span className="block text-[0.7rem] text-[#8d8a9c]">
                    +{row.abandoned} sem sair
                  </span>
                )}
              </td>
              <td className="py-3 pl-3 sm:pl-5">
                <div className="flex items-center gap-2.5">
                  <span className="tabular w-7 font-semibold text-[#1b1a22]">
                    {row.attempts > 0 ? formatLevel(row.averageLevel) : '—'}
                  </span>
                  <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-[#efedf5] sm:block">
                    <span
                      className="block h-full rounded-full bg-[#8e7ff0] transition-[width] duration-500"
                      style={{ width: `${Math.min(100, (row.averageLevel / MAX_LEVEL) * 100)}%` }}
                    />
                  </span>
                </div>
              </td>
              <td className="hidden py-3 pl-3 lg:table-cell">
                <Sparkline levels={row.levels} />
              </td>
              <td className="py-3 pr-5 text-right">
                {row.attempts > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] whitespace-nowrap text-[#3a3846]">
                    <span className={`size-1.5 rounded-full ${STATE_DOT[row.state]}`} />
                    {STATE_LABEL[row.state]}
                  </span>
                ) : (
                  <span className="text-[0.78rem] whitespace-nowrap text-[#8d8a9c]">ainda não saiu</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
