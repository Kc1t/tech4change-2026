'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  BrandMark,
  Insight,
  NotificationBell,
  Screen,
  ScreenHeader,
  Sparkle,
  TopBar
} from '@/components/layout'
import { Gauge } from '@/components/progress/Gauge'
import { StatCard } from '@/components/progress/StatCard'
import { TrendSky } from '@/components/progress/TrendSky'
import { formatLevel, summarise } from '@/domain/progress'
import { lifeGraph, useApp } from '@/store'
import type { Mastery } from '@/domain/types'

const MASTERY_TINT: Record<Mastery, string> = {
  high: '--mastery-high',
  medium: '--mastery-medium',
  low: '--mastery-low',
  unseen: '--line'
}

const MARKS = 5

function dayLabel(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
}

export function ProgressScreen() {
  const history = useApp(s => s.history)
  const learning = useApp(s => s.learning)
  const demo = useApp(s => s.demo)
  const loadDemo = useApp(s => s.loadDemo)
  const clearDemo = useApp(s => s.clearDemo)

  const progress = useMemo(() => summarise(history), [history])

  const words = useMemo(() => {
    return Object.entries(learning)
      .filter(([id, state]) => state.lastSeen !== null && lifeGraph.nodes[id])
      .map(([id, state]) => ({
        id,
        label: lifeGraph.nodes[id]!.label,
        mastery: state.mastery,
        level: state.lastLevel ?? 0
      }))
      .sort((a, b) => a.level - b.level)
  }, [learning])

  const unaided = words.filter(word => word.mastery === 'high').length
  const drop =
    progress.average !== null && progress.previous !== null
      ? progress.previous - progress.average
      : null

  if (progress.attempts === 0) {
    return (
      <Screen scroll={false}>
        <TopBar left={<BrandMark />} right={<NotificationBell />} />
        <ScreenHeader
          label="o progresso"
          title="Ainda não há nada para mostrar"
          sub="Esta tela só mostra o que realmente aconteceu. Assim que ela alcançar a primeira palavra na tela Momento, o registro começa aqui."
        />
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href="/"
            className="grid min-h-tap place-items-center rounded-full bg-fg px-5 text-[14px] font-semibold text-ink"
          >
            Ir para o Momento
          </Link>
          <button
            onClick={loadDemo}
            className="grid min-h-tap place-items-center rounded-full bg-surface px-5 text-[14px] font-semibold text-dim shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)]"
          >
            Ver com dados de exemplo
          </button>
        </div>
      </Screen>
    )
  }

  const latest = history[history.length - 1]!
  const unaidedRuns = history.filter(entry => entry.level <= 1).length

  const marks = Array.from({ length: MARKS }, (_, index) => {
    const at = history[Math.round((index / (MARKS - 1)) * (history.length - 1))]
    return at ? dayLabel(at.at) : ''
  })

  return (
    <Screen className="px-0">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[linear-gradient(180deg,#f8dcdb_0%,#fbe7d3_50%,var(--ink)_100%)]"
      />

      <div className="relative px-7">
        <TopBar left={<BrandMark />} right={<NotificationBell />} />
        <ScreenHeader label="o progresso" title="Quanto ela já alcança sozinha" />
      </div>

      <div className="relative mt-12">
        <TrendSky series={progress.series} marks={marks} />
      </div>

      <div className="relative mt-12 px-7">
        <Insight>
          {drop !== null && drop > 0.05
            ? `Menos ajuda nas últimas ${Math.min(5, history.length)} vezes`
            : unaidedRuns > 0
              ? `${unaidedRuns} ${unaidedRuns === 1 ? 'vez' : 'vezes'} sem precisar da escada`
              : 'A escada ainda vai inteira — é o começo'}
        </Insight>
      </div>

      <div className="relative mt-8 flex gap-4 px-7">
        <StatCard
          label="Degrau médio"
          value={progress.average !== null ? formatLevel(progress.average) : '—'}
          unit={`de ${latest.rungs}`}
          delta={
            drop === null
              ? undefined
              : drop > 0.05
                ? `−${formatLevel(drop)} que antes`
                : drop < -0.05
                  ? `+${formatLevel(-drop)} que antes`
                  : 'estável'
          }
          tone={drop !== null && drop < -0.05 ? 'down' : 'up'}
        />
        <StatCard
          label="Sozinha"
          value={String(unaided)}
          unit={words.length > 0 ? `de ${words.length}` : undefined}
          delta={`${history.length} ${history.length === 1 ? 'tentativa' : 'tentativas'}`}
          tone="note"
        />
      </div>

      <div className="relative mt-8 px-7">
        <div className="mb-3 flex items-center gap-2">
          <Sparkle muted />
          <h3 className="text-[17px] font-bold tracking-[-0.02em] text-fg">O que mudou</h3>
        </div>

        <p className="text-[15px] font-medium leading-relaxed text-dim">
          {drop !== null && drop > 0.05
            ? `O degrau médio caiu de ${formatLevel(progress.previous!)} para ${formatLevel(progress.average!)}. Ela está chegando na palavra mais cedo na escada — que é exatamente o que este aplicativo existe para fazer.`
            : `Foram ${history.length} ${history.length === 1 ? 'palavra alcançada' : 'palavras alcançadas'} até agora. A partir de dez tentativas dá para comparar uma semana com a outra e ver se a ajuda está diminuindo.`}
        </p>
      </div>

      <div className="relative mt-6 px-7">
        <p className="text-[32px] font-bold leading-tight tracking-[-0.04em] text-fg tabular">
          {progress.autonomy !== null ? Math.round(progress.autonomy) : '—'}
        </p>
        <p className="mb-4 text-[13px] font-semibold text-faint">Autonomia</p>
        <Gauge value={progress.autonomy ?? 0} caption="Autonomia" />
      </div>

      <div className="relative mt-8 px-7">
        <h3 className="mb-3 text-base font-bold tracking-[-0.02em] text-fg">Palavras</h3>
        <div className="flex flex-wrap gap-2">
          {words.map(word => (
            <span
              key={word.id}
              className="flex items-center gap-2 rounded-full bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] px-3 py-2 text-[13.5px] font-medium text-fg"
            >
              <i
                className="block size-2 rounded-full"
                style={{ background: `var(${MASTERY_TINT[word.mastery]})` }}
              />
              {word.label}
            </span>
          ))}
        </div>

        {demo ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-[0.68rem] leading-relaxed text-faint">
              Estes são dados de exemplo, de oito semanas de uso. Nenhum deles veio deste aparelho.
            </p>
            <button
              onClick={clearDemo}
              className="shrink-0 text-[12px] font-semibold text-brand"
            >
              Limpar
            </button>
          </div>
        ) : (
          <p className="mt-6 text-[0.68rem] leading-relaxed text-faint">
            Nada aqui é estimativa. Cada ponto é uma palavra que ela alcançou neste aparelho, com o
            degrau em que chegou.
          </p>
        )}
      </div>
    </Screen>
  )
}
