import { ChevronRight, Lock } from 'lucide-react'
import type { Rung } from './desk-listener'

function andamento(level: number, total: number) {
  const faltam = total - level
  if (faltam <= 0) return 'Este é o som do começo da palavra.'
  if (faltam === 1) return 'Falta um, e ele é o som.'
  if (level === 1) return 'A dica ainda está larga.'
  return 'Estreitando.'
}

export function LadderPanel({
  rungs,
  level,
  answer,
  resolved
}: {
  rungs: Rung[]
  level: number
  answer: string
  resolved: boolean
}) {
  return (
    <section className="v3-glass flex flex-col rounded-[1.5rem] px-7 py-6">
      <header>
        <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--v3-accent-deep)] uppercase">
          A escada
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--v3-muted)]">
          {resolved
            ? rungs.length === 1
              ? 'A palavra saiu com a dica sozinha.'
              : level < rungs.length
                ? `A palavra saiu no degrau ${level}. Os degraus acima nem foram usados.`
                : 'A palavra saiu no último degrau.'
            : level === 0
              ? 'Nenhum degrau ainda. Cada toque revela o próximo.'
              : `Degrau ${level} de ${rungs.length}. ${andamento(level, rungs.length)}`}
        </p>
      </header>

      <ol className="mt-6 flex flex-col gap-2.5">
        {rungs.map(rung => {
          const open = rung.level <= level
          const current = rung.level === level && !resolved

          return (
            <li
              key={rung.level}
              className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-colors duration-500 ${
                current
                  ? 'bg-[linear-gradient(140deg,#7a6bb4,#4a4166)] text-white'
                  : open
                    ? 'bg-[#f1eefa]'
                    : 'bg-white/60'
              }`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-xl text-[0.8rem] font-semibold ${
                  current
                    ? 'bg-white/20 text-white'
                    : open
                      ? 'bg-[#ddd5f5] text-[var(--v3-accent-deep)]'
                      : 'bg-[#eceaf3] text-[#b6b0c6]'
                }`}
              >
                {open ? rung.level : <Lock className="size-3.5" />}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[0.62rem] font-semibold tracking-[0.12em] uppercase ${
                    current ? 'text-white/60' : 'text-[var(--v3-accent)]'
                  }`}
                >
                  {rung.kind}
                </span>
                <span
                  className={`block truncate text-[0.95rem] leading-snug ${
                    open ? '' : 'text-[#b6b0c6]'
                  }`}
                >
                  {open ? rung.text : 'ainda travado'}
                </span>
              </span>

              <ChevronRight
                className={`size-4 shrink-0 ${
                  current ? 'text-white/60' : open ? 'text-[var(--v3-accent)]' : 'text-[#c9c4d6]'
                }`}
              />
            </li>
          )
        })}
      </ol>

      <div className="mt-5 border-t border-[var(--v3-line)] px-1 pt-4">
        <p className="text-[0.62rem] font-semibold tracking-[0.12em] text-[var(--v3-accent)] uppercase">
          A palavra
        </p>
        {resolved ? (
          <p className="mt-1.5 text-[1.4rem] leading-none font-semibold tracking-[-0.03em] text-[var(--v3-accent-deep)]">
            {answer}
          </p>
        ) : (
          <span aria-hidden="true" className="mt-3 flex gap-2">
            {rungs.map(rung => (
              <i key={rung.level} className="block h-[2px] w-5 rounded-full bg-[#d9d4e8]" />
            ))}
          </span>
        )}
      </div>
    </section>
  )
}
