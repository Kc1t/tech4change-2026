import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Gauge, StatCard, TrendSky } from '../components/progress'
import { NotificationBell } from '../components/NotificationBell'
import { BrandMark, Insight, Screen, ScreenHeader, Sparkle, TopBar } from '../components/ui'
import { formatLevel, summarise } from '../domain/progress'
import { lifeGraph, useApp } from '../store'
import { color, shadow } from '../theme/tokens'
import type { Mastery } from '../domain/types'

const MASTERY_TINT: Record<Mastery, string> = {
  high: color.masteryHigh,
  medium: color.masteryMedium,
  low: color.masteryLow,
  unseen: color.line
}

const MARKS = 5
const BLOCK = 'mt-5'
const SECTION_TITLE = 'font-heavy text-[17px] tracking-[-0.4px] text-fg'
const NOTE = 'mt-3 font-book text-[11px] leading-[17px] text-faint'
const PILL = 'min-h-tap justify-center rounded-full px-5'
const SOFT = { ...shadow.card, shadowOpacity: 0.06 }


function dayLabel(iso: string): string {
  const date = new Date(iso)
  const month = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][
    date.getMonth()
  ]
  return `${String(date.getDate()).padStart(2, '0')} de ${month}`
}

export function ProgressScreen({ onHome, onBell }: { onHome: () => void; onBell: () => void }) {
  const history = useApp(s => s.history)
  const learning = useApp(s => s.learning)
  const demo = useApp(s => s.demo)
  const loadDemo = useApp(s => s.loadDemo)
  const clearDemo = useApp(s => s.clearDemo)

  const progress = useMemo(() => summarise(history), [history])

  const words = useMemo(
    () =>
      Object.entries(learning)
        .filter(([id, state]) => state.lastSeen !== null && lifeGraph.nodes[id])
        .map(([id, state]) => ({
          id,
          label: lifeGraph.nodes[id]!.label,
          mastery: state.mastery,
          level: state.lastLevel ?? 0
        }))
        .sort((a, b) => a.level - b.level),
    [learning]
  )

  const unaided = words.filter(word => word.mastery === 'high').length
  const drop =
    progress.average !== null && progress.previous !== null
      ? progress.previous - progress.average
      : null

  if (progress.attempts === 0) {
    return (
      <Screen scroll={false}>
        <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />
        <ScreenHeader
          title="Progresso"
          sub="Nada registrado ainda. Começa na primeira palavra alcançada."
        />
        <View className="mt-3 flex-row flex-wrap gap-2.5">
          <Pressable onPress={onHome} className={`${PILL} bg-fg`}>
            <Text className="font-strong text-body text-ink">Ir para o Momento</Text>
          </Pressable>
          <Pressable onPress={loadDemo} className={`${PILL} bg-surface`} style={SOFT}>
            <Text className="font-strong text-body text-dim">Ver com dados de exemplo</Text>
          </Pressable>
        </View>
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
    <Screen>
      <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />
      <ScreenHeader title="Progresso" sub="Quanto ela já alcança sozinha." />

      <View className="-mx-6 mt-3">
        <TrendSky series={progress.series} marks={marks} />
      </View>

      <View className={BLOCK}>
        <Insight>
          {drop !== null && drop > 0.05
            ? `Menos ajuda nas últimas ${Math.min(5, history.length)} vezes`
            : unaidedRuns > 0
              ? `${unaidedRuns} ${unaidedRuns === 1 ? 'vez' : 'vezes'} sem precisar da escada`
              : 'A escada ainda vai inteira — é o começo'}
        </Insight>
      </View>

      <View className="mt-5 flex-row gap-4">
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
      </View>

      <View className={BLOCK}>
        <View className="mb-3 flex-row items-center gap-2">
          <Sparkle muted />
          <Text className={SECTION_TITLE}>O que mudou</Text>
        </View>
        <Text className="font-mid text-[15px] leading-[23px] text-dim">
          {drop !== null && drop > 0.05
            ? `O degrau médio caiu de ${formatLevel(progress.previous!)} para ${formatLevel(progress.average!)}. Ela está chegando na palavra mais cedo na escada — que é exatamente o que este aplicativo existe para fazer.`
            : `Foram ${history.length} ${history.length === 1 ? 'palavra alcançada' : 'palavras alcançadas'} até agora. A partir de dez tentativas dá para comparar uma semana com a outra e ver se a ajuda está diminuindo.`}
        </Text>
      </View>

      <View className={BLOCK}>
        <Text className="font-heavy text-[32px] tracking-[-1.3px] text-fg">
          {progress.autonomy !== null ? Math.round(progress.autonomy) : '—'}
        </Text>
        <Text className="mb-4 mt-0.5 font-strong text-hint text-faint">Autonomia</Text>
        <Gauge value={progress.autonomy ?? 0} />
      </View>

      <View className={BLOCK}>
        <Text className={SECTION_TITLE}>Palavras</Text>
        <View className="flex-row flex-wrap gap-2">
          {words.map(word => (
            <View
              key={word.id}
              className="flex-row items-center gap-2 rounded-full bg-surface px-3 py-2"
              style={{ ...shadow.card, shadowOpacity: 0.05 }}
            >
              <View
                className="size-2 rounded-full"
                style={{ backgroundColor: MASTERY_TINT[word.mastery] }}
              />
              <Text className="font-mid text-[13.5px] text-fg">{word.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {demo ? (
        <View className="mt-3 flex-row items-center gap-3">
          <Text className={`${NOTE} flex-1`}>
            Estes são dados de exemplo, de oito semanas de uso. Nenhum deles veio deste aparelho.
          </Text>
          <Pressable onPress={clearDemo} hitSlop={8}>
            <Text className="mt-3 font-strong text-note text-brand">Limpar</Text>
          </Pressable>
        </View>
      ) : (
        <Text className={NOTE}>
          Nada aqui é estimativa. Cada ponto é uma palavra que ela alcançou neste aparelho, com o
          degrau em que chegou.
        </Text>
      )}
    </Screen>
  )
}
