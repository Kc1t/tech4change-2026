import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Speech from 'expo-speech'
import { BuzzPicker, DeviceList } from '../components/DevicePanel'
import { SyncPanel } from '../components/SyncPanel'
import { NotificationBell } from '../components/NotificationBell'
import { BrandMark, Card, Screen, ScreenHeader, TopBar } from '../components/ui'
import { useApp } from '../store'
import { color, font, radius, shadow, tap } from '../theme/tokens'
import type { HelpLevel, OutputMode } from '../domain/types'

const HELP: Array<{ value: HelpLevel; label: string; hint: string }> = [
  { value: 'deliver', label: 'Entrega', hint: 'a palavra vem direto, sem escada' },
  { value: 'hint', label: 'Dica', hint: 'um degrau por vez, do geral até o som' },
  { value: 'ladder', label: 'Escada', hint: 'sempre começa do primeiro degrau' }
]

const OUTPUT: Array<{ value: OutputMode; label: string; hint: string }> = [
  { value: 'voice', label: 'Voz', hint: 'só o fone fala' },
  { value: 'text', label: 'Texto', hint: 'só aparece na tela' },
  { value: 'both', label: 'Ambos', hint: 'fala e mostra' }
]

export function BodyScreen({ onBell }: { onBell: () => void }) {
  const paired = useApp(s => s.paired)
  const helpLevel = useApp(s => s.helpLevel)
  const output = useApp(s => s.output)
  const setHelpLevel = useApp(s => s.setHelpLevel)
  const setOutput = useApp(s => s.setOutput)

  const live = paired.filter(device => device.on).length

  return (
    <Screen gap={12}>
      <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />

      <ScreenHeader
        label="os aparelhos"
        title="Onde a ajuda chega"
        sub={`${live} de ${paired.length} ligados. A dica chega em todos no mesmo instante.`}
      />

      <DeviceList />

      <ScreenHeader
        label="onde vibra"
        title="O que bate junto com a dica"
        sub="Escolha em que aparelho você quer sentir. A vibração marca o tempo, não a palavra."
      />

      <BuzzPicker />

      <ScreenHeader
        label="a mesma sessão"
        title="Ligar celular e relógio"
        sub="Um código de quatro dígitos põe os dois na mesma conversa. A ponte leva o degrau, nunca a palavra."
      />

      <SyncPanel />

      <Card>
        <Text style={styles.cardLabel}>QUANTA AJUDA</Text>
        <Segmented options={HELP} value={helpLevel} onChange={setHelpLevel} />
        <Text style={styles.hint}>{HELP.find(o => o.value === helpLevel)?.hint}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>POR ONDE</Text>
        <Segmented options={OUTPUT} value={output} onChange={setOutput} />
        <Text style={styles.hint}>{OUTPUT.find(o => o.value === output)?.hint}</Text>
      </Card>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          Speech.speak('Letícia', { language: 'pt-BR' })
        }}
        style={styles.test}
      >
        <Text style={styles.testText}>Sentir e ouvir agora</Text>
      </Pressable>

      <Text style={styles.note}>
        Esta tela é o controle de privacidade. O que estiver desligado aqui não é usado, e nenhum
        áudio sai do aparelho.
      </Text>
    </Screen>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <View style={styles.options}>
      {options.map(option => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ selected: option.value === value }}
          onPress={() => onChange(option.value)}
          style={[styles.option, option.value === value && styles.optionOn]}
        >
          <Text style={[styles.optionText, option.value === value && styles.optionTextOn]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  cardLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.label,
    marginBottom: 12
  },
  options: { flexDirection: 'row', gap: 6 },
  option: {
    flex: 1,
    minHeight: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    backgroundColor: color.surface2
  },
  optionOn: { backgroundColor: color.fg },
  optionText: { fontFamily: font.medium, fontSize: 14, color: color.dim },
  optionTextOn: { fontFamily: font.semibold, color: color.ink },
  hint: { fontFamily: font.regular, fontSize: 13, color: color.faint, marginTop: 12 },
  test: {
    minHeight: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.large,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  testText: { fontFamily: font.semibold, fontSize: 14, color: color.fg },
  note: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: color.faint, marginTop: 8 }
})
