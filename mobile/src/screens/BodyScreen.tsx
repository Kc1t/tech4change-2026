import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Speech from 'expo-speech'
import Svg, { Path } from 'react-native-svg'
import { NotificationBell } from '../components/NotificationBell'
import { BrandMark, Card, Screen, ScreenHeader, TopBar } from '../components/ui'
import { useApp } from '../store'
import { color, font, radius, shadow, tap } from '../theme/tokens'
import type { ChannelState, HelpLevel, OutputMode } from '../domain/types'

const DEVICES: Array<{
  key: keyof ChannelState
  name: string
  role: string
  detail: string
  tint: string
  path: string
}> = [
  {
    key: 'phone',
    name: 'Celular',
    role: 'mostra a palavra',
    detail: 'a dica aparece na tela e vibra no ritmo dela',
    tint: color.brandSoft,
    path: 'M7.4 2.6h9.2a1.8 1.8 0 0 1 1.8 1.8v15.2a1.8 1.8 0 0 1-1.8 1.8H7.4a1.8 1.8 0 0 1-1.8-1.8V4.4a1.8 1.8 0 0 1 1.8-1.8ZM10.4 18.6h3.2'
  },
  {
    key: 'earbuds',
    name: 'Fone',
    role: 'fala a dica',
    detail: 'ninguém mais na mesa ouve — é o canal discreto',
    tint: '#d5e2f2',
    path: 'M12 3.4a7 7 0 0 0-7 7v5.2M12 3.4a7 7 0 0 1 7 7v5.2M5 13.4h1.6a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.4V15a1.6 1.6 0 0 1 1-1.6ZM19 13.4h-1.6a1.6 1.6 0 0 0-1.6 1.6v3.4a1.6 1.6 0 0 0 1.6 1.6h.8a1.6 1.6 0 0 0 1.6-1.6V15a1.6 1.6 0 0 0-.8-1.6Z'
  },
  {
    key: 'watch',
    name: 'Relógio',
    role: 'marca o degrau',
    detail: 'vibra no pulso e mostra em que degrau ela está',
    tint: '#d3e8d8',
    path: 'M12 7.4v4.2l2.6 1.6M8.6 4.6 9 2.4h6l.4 2.2M8.6 19.4 9 21.6h6l.4-2.2M12 19.4a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8Z'
  }
]

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
  const channels = useApp(s => s.channels)
  const helpLevel = useApp(s => s.helpLevel)
  const output = useApp(s => s.output)
  const toggleChannel = useApp(s => s.toggleChannel)
  const setHelpLevel = useApp(s => s.setHelpLevel)
  const setOutput = useApp(s => s.setOutput)

  const live = DEVICES.filter(device => channels[device.key]).length

  return (
    <Screen gap={12}>
      <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />

      <ScreenHeader
        label="os aparelhos"
        title="Onde a ajuda aparece"
        sub={`${live} de ${DEVICES.length} ligados. A dica chega em todos ao mesmo tempo.`}
      />

      <View style={styles.devices}>
        {DEVICES.map(device => {
          const on = channels[device.key]
          return (
            <Pressable
              key={device.key}
              onPress={() => {
                void Haptics.selectionAsync()
                toggleChannel(device.key)
              }}
              style={styles.device}
            >
              <View style={[styles.deviceIcon, { backgroundColor: on ? device.tint : color.surface2 }]}>
                <Svg viewBox="0 0 24 24" width={22} height={22}>
                  <Path
                    d={device.path}
                    fill="none"
                    stroke={on ? color.fg : color.faint}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.deviceBody}>
                <View style={styles.deviceHead}>
                  <Text style={[styles.deviceName, !on && { color: color.faint }]}>
                    {device.name}
                  </Text>
                  <Text style={styles.deviceRole}>{device.role}</Text>
                </View>
                <Text style={styles.deviceDetail}>{device.detail}</Text>
              </View>

              <Switch
                value={on}
                onValueChange={() => toggleChannel(device.key)}
                trackColor={{ false: color.surface2, true: color.brand }}
                thumbColor={color.surface}
              />
            </Pressable>
          )
        })}
      </View>

      <Card>
        <Text style={styles.cardLabel}>QUANTA AJUDA</Text>
        <Segmented
          options={HELP}
          value={helpLevel}
          onChange={setHelpLevel}
        />
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
  devices: { gap: 10 },
  device: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: color.surface,
    borderRadius: radius.large,
    padding: 16,
    minHeight: 0,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  deviceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  deviceBody: { flex: 1, minWidth: 0 },
  deviceHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  deviceName: { fontFamily: font.semibold, fontSize: 16, letterSpacing: -0.4, color: color.fg },
  deviceRole: { fontFamily: font.medium, fontSize: 12.5, color: color.brand },
  deviceDetail: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17, color: color.faint, marginTop: 4 },
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
