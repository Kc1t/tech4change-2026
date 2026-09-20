import { useCallback, useState } from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Speech from 'expo-speech'
import { BuzzPicker, DeviceList } from '../components/DevicePanel'
import { SyncPanel } from '../components/SyncPanel'
import { NotificationBell } from '../components/NotificationBell'
import { BrandMark, Card, RowLink, Screen, ScreenHeader, Segmented, Tabs, TopBar } from '../components/ui'
import { useApp } from '../store'
import { broadcastCue } from '../sync/client'
import { patternFor, pulse } from '../haptics'
import { color, shadow } from '../theme/tokens'
import type { HelpLevel, OutputMode } from '../domain/types'

type Tab = 'devices' | 'help' | 'session'

const TABS = [
  { value: 'devices' as const, label: 'Aparelhos' },
  { value: 'help' as const, label: 'Ajuda' },
  { value: 'session' as const, label: 'Sessão' }
]

const HELP: Array<{ value: HelpLevel; label: string; hint: string }> = [
  { value: 'deliver', label: 'Entrega', hint: 'a palavra vem direto, sem escada' },
  { value: 'hint', label: 'Dica', hint: 'um degrau por vez' },
  { value: 'ladder', label: 'Escada', hint: 'sempre do primeiro degrau' }
]

const OUTPUT: Array<{ value: OutputMode; label: string; hint: string }> = [
  { value: 'voice', label: 'Voz', hint: 'só o fone fala' },
  { value: 'text', label: 'Texto', hint: 'só aparece na tela' },
  { value: 'both', label: 'Ambos', hint: 'fala e mostra' }
]

const CARD_LABEL = 'mb-3 font-strong text-caps text-label'
const HINT = 'mt-3 font-book text-hint text-faint'
const NOTE = 'font-book text-note leading-[18px] text-faint'

export function BodyScreen({
  onBell,
  onClinical,
  onRestart,
  onDemo
}: {
  onBell: () => void
  onClinical: () => void
  onRestart: () => void
  onDemo: () => void
}) {
  const [tab, setTab] = useState<Tab>('devices')

  return (
    <Screen>
      <TopBar left={<BrandMark />} right={<NotificationBell onPress={onBell} />} />
      <ScreenHeader title="Configurações" />
      <Tabs options={TABS} value={tab} onChange={setTab} />

      {tab === 'devices' && <Devices />}
      {tab === 'help' && <Help />}
      {tab === 'session' && <Session onClinical={onClinical} onRestart={onRestart} onDemo={onDemo} />}
    </Screen>
  )
}

function Devices() {
  const paired = useApp(s => s.paired)
  const live = paired.filter(device => device.on).length

  return (
    <>
      <Text className={NOTE}>
        {live} de {paired.length} ligados. A dica chega em todos no mesmo instante.
      </Text>

      <DeviceList />

      <Text className={CARD_LABEL}>ONDE VIBRA</Text>
      <BuzzPicker />

      <Text className={CARD_LABEL}>FORÇA DA VIBRAÇÃO</Text>
      <Strength />
    </>
  )
}

function Strength() {
  const intensity = useApp(s => s.intensity)
  const setIntensity = useApp(s => s.setIntensity)

  return (
    <View className="flex-row gap-1.5">
      {[1, 2, 3, 4, 5].map(step => (
        <Pressable
          key={step}
          accessibilityRole="radio"
          accessibilityLabel={`Força ${step} de 5`}
          accessibilityState={{ selected: step === intensity }}
          onPress={() => {
            setIntensity(step)
            void Haptics.impactAsync(
              step >= 4
                ? Haptics.ImpactFeedbackStyle.Heavy
                : step <= 2
                  ? Haptics.ImpactFeedbackStyle.Light
                  : Haptics.ImpactFeedbackStyle.Medium
            )
          }}
          className={`min-h-tap flex-1 items-center justify-center rounded-card ${
            step <= intensity ? 'bg-fg' : 'bg-surface-2'
          }`}
        >
          <Text className={`font-strong text-body ${step <= intensity ? 'text-ink' : 'text-dim'}`}>
            {step}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function Help() {
  const helpLevel = useApp(s => s.helpLevel)
  const output = useApp(s => s.output)
  const setHelpLevel = useApp(s => s.setHelpLevel)
  const setOutput = useApp(s => s.setOutput)

  return (
    <>
      <Card>
        <Text className={CARD_LABEL}>QUANTA AJUDA</Text>
        <Segmented options={HELP} value={helpLevel} onChange={setHelpLevel} />
        <Text className={HINT}>{HELP.find(o => o.value === helpLevel)?.hint}</Text>
      </Card>

      <Card>
        <Text className={CARD_LABEL}>POR ONDE</Text>
        <Segmented options={OUTPUT} value={output} onChange={setOutput} />
        <Text className={HINT}>{OUTPUT.find(o => o.value === output)?.hint}</Text>
      </Card>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          Speech.speak('Letícia', { language: 'pt-BR' })
        }}
        className="min-h-tap items-center justify-center rounded-large bg-surface"
        style={{ ...shadow.card, shadowOpacity: 0.06 }}
      >
        <Text className="font-strong text-body text-fg">Sentir e ouvir agora</Text>
      </Pressable>

      <Text className={NOTE}>
        O que estiver desligado aqui não é usado, e nenhum áudio sai do aparelho.
      </Text>
    </>
  )
}

function Session({
  onClinical,
  onRestart,
  onDemo
}: {
  onClinical: () => void
  onRestart: () => void
  onDemo: () => void
}) {
  const output = useApp(s => s.output)
  const setOutput = useApp(s => s.setOutput)
  const sessionCode = useApp(s => s.sessionCode)
  const deviceId = useApp(s => s.deviceId)
  const devices = useApp(s => s.devices)
  const intensity = useApp(s => s.intensity)
  const aloud = output !== 'text'

  const watchOn = devices.some(device => device.kind === 'watch')

  const testPulse = useCallback(() => {
    pulse(patternFor(3, false), intensity)
    if (!sessionCode || !deviceId) return
    broadcastCue(sessionCode, {
      deviceId,
      targetId: 'n_fd8f8a',
      level: 3,
      attr: 'city',
      edge: null,
      isFinal: false,
      event: 'cue'
    })
  }, [sessionCode, deviceId, intensity])

  return (
    <>
      <Text className={NOTE}>
        Um código de quatro dígitos põe celular e relógio na mesma conversa.
      </Text>

      <View
        className="min-h-tap flex-row items-center justify-between rounded-large bg-surface px-4 py-3"
        style={{ ...shadow.card, shadowOpacity: 0.06 }}
      >
        <View className="flex-1 pr-3">
          <Text className="font-strong text-body text-fg">Falar em voz alta</Text>
          <Text className="mt-0.5 font-book text-note text-faint">
            {aloud ? 'A dica é falada quando chega.' : 'A dica só vibra e aparece na tela.'}
          </Text>
        </View>
        <Switch
          value={aloud}
          onValueChange={next => setOutput(next ? 'both' : 'text')}
          trackColor={{ false: color.surface2, true: color.brand }}
          thumbColor={color.surface}
        />
      </View>

      <SyncPanel />

      <RowLink onPress={testPulse}>Testar o degrau 3 nos dois</RowLink>
      <Text className={NOTE}>
        {watchOn
          ? 'Três toques aqui e três no relógio, ao mesmo tempo.'
          : 'O relógio não está na sessão — por enquanto só este celular vibra.'}
      </Text>

      <RowLink onPress={onClinical}>Painel do fonoaudiólogo</RowLink>

      <RowLink onPress={onRestart}>Refazer o primeiro acesso</RowLink>

      <RowLink onPress={onDemo} accent>
        Disparar demo
      </RowLink>
    </>
  )
}
