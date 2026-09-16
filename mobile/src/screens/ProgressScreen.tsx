import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Gauge, StatCard, TrendSky } from '../components/progress'
import { NotificationBell } from '../components/NotificationBell'
import { BrandMark, Insight, Screen, ScreenHeader, Sparkle, TopBar } from '../components/ui'
import { formatLevel, summarise } from '../domain/progress'
import { lifeGraph, useApp } from '../store'
import { color, font, radius, shadow } from '../theme/tokens'
import type { Mastery } from '../domain/types'

const MASTERY_TINT: Record<Mastery, string> = {
  high: color.masteryHigh,
  medium: color.masteryMedium,
  low: color.masteryLow,
  unseen: color.line
}

const MARKS = 5

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
      <Screen scroll={false} gap={0}>
        <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />
        <ScreenHeader
          label="o progresso"
          title="Ainda não há nada para mostrar"
          sub="Esta tela só mostra o que realmente aconteceu. Assim que ela alcançar a primeira palavra na tela Momento, o registro começa aqui."
        />
        <View style={styles.emptyRow}>
          <Pressable onPress={onHome} style={styles.primary}>
            <Text style={styles.primaryText}>Ir para o Momento</Text>
          </Pressable>
          <Pressable onPress={loadDemo} style={styles.secondary}>
            <Text style={styles.secondaryText}>Ver com dados de exemplo</Text>
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
      <ScreenHeader label="o progresso" title="Quanto ela já alcança sozinha" />

      <View style={styles.chart}>
        <TrendSky series={progress.series} marks={marks} />
      </View>

      <View style={styles.block}>
        <Insight>
          {drop !== null && drop > 0.05
            ? `Menos ajuda nas últimas ${Math.min(5, history.length)} vezes`
            : unaidedRuns > 0
              ? `${unaidedRuns} ${unaidedRuns === 1 ? 'vez' : 'vezes'} sem precisar da escada`
              : 'A escada ainda vai inteira — é o começo'}
        </Insight>
      </View>

      <View style={styles.cards}>
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

      <View style={styles.block}>
        <View style={styles.sectionHead}>
          <Sparkle muted />
          <Text style={styles.sectionTitle}>O que mudou</Text>
        </View>
        <Text style={styles.body}>
          {drop !== null && drop > 0.05
            ? `O degrau médio caiu de ${formatLevel(progress.previous!)} para ${formatLevel(progress.average!)}. Ela está chegando na palavra mais cedo na escada — que é exatamente o que este aplicativo existe para fazer.`
            : `Foram ${history.length} ${history.length === 1 ? 'palavra alcançada' : 'palavras alcançadas'} até agora. A partir de dez tentativas dá para comparar uma semana com a outra e ver se a ajuda está diminuindo.`}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.score}>
          {progress.autonomy !== null ? Math.round(progress.autonomy) : '—'}
        </Text>
        <Text style={styles.scoreLabel}>Autonomia</Text>
        <Gauge value={progress.autonomy ?? 0} />
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Palavras</Text>
        <View style={styles.chips}>
          {words.map(word => (
            <View key={word.id} style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: MASTERY_TINT[word.mastery] }]} />
              <Text style={styles.chipText}>{word.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {demo ? (
        <View style={styles.demoRow}>
          <Text style={styles.note}>
            Estes são dados de exemplo, de oito semanas de uso. Nenhum deles veio deste aparelho.
          </Text>
          <Pressable onPress={clearDemo} hitSlop={8}>
            <Text style={styles.clear}>Limpar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.note}>
          Nada aqui é estimativa. Cada ponto é uma palavra que ela alcançou neste aparelho, com o
          degrau em que chegou.
        </Text>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  chart: { marginTop: 24, marginHorizontal: -24 },
  block: { marginTop: 32 },
  cards: { flexDirection: 'row', gap: 16, marginTop: 32 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: font.bold, fontSize: 17, letterSpacing: -0.4, color: color.fg },
  body: { fontFamily: font.medium, fontSize: 15, lineHeight: 23, color: color.dim },
  score: { fontFamily: font.bold, fontSize: 32, letterSpacing: -1.3, color: color.fg },
  scoreLabel: { fontFamily: font.semibold, fontSize: 13, color: color.faint, marginTop: 2, marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadow.card,
    shadowOpacity: 0.05
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: font.medium, fontSize: 13.5, color: color.fg },
  emptyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  primary: {
    backgroundColor: color.fg,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center'
  },
  primaryText: { fontFamily: font.semibold, fontSize: 14, color: color.ink },
  secondary: {
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center',
    ...shadow.card,
    shadowOpacity: 0.06
  },
  secondaryText: { fontFamily: font.semibold, fontSize: 14, color: color.dim },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  note: { flex: 1, fontFamily: font.regular, fontSize: 11, lineHeight: 17, color: color.faint, marginTop: 24 },
  clear: { fontFamily: font.semibold, fontSize: 12, color: color.brand, marginTop: 24 }
})
