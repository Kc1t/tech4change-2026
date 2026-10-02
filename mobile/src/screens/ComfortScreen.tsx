import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { AuroraField } from '../components/AuroraField'
import { BrandMark, Segmented } from '../components/ui'
import { PATIENCE, VOICES, voiceIntro, type VoiceChoice } from '../domain/comfort'
import { useApp } from '../store'
import { previewVoice, stopVoice } from '../voice'
import { color, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const STEPS = ['voice', 'rhythm', 'agreement'] as const
type Step = (typeof STEPS)[number]

const AGREEMENT = [
  'Eu só escuto quando você tocar para começar.',
  'Dá para pausar a qualquer momento, com um toque.',
  'Nada é gravado. O som vira texto na hora e é descartado.',
  'Quem acha a palavra é você. Eu só aponto o caminho.'
]

export function ComfortScreen({ owner, onDone }: { owner?: string; onDone: () => void }) {
  const [step, setStep] = useState<Step>('voice')
  const index = STEPS.indexOf(step)

  function next() {
    stopVoice()
    void Haptics.selectionAsync()
    if (step === 'agreement') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onDone()
      return
    }
    setStep(STEPS[index + 1]!)
  }

  return (
    <View className="flex-1 bg-ink">
      <View className="absolute inset-x-0 bottom-0 h-[30%] opacity-70">
        <AuroraField state="listening" level={0.16} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingTop: TOP_INSET, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="h-11 flex-row items-center justify-between">
          <BrandMark />
          {index > 0 && (
            <Pressable
              onPress={() => setStep(STEPS[index - 1]!)}
              hitSlop={8}
              className="min-h-tap justify-center px-2"
            >
              <Text className="font-strong text-hint text-dim">Voltar</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-7 flex-row gap-1.5">
          {STEPS.map((name, position) => (
            <View
              key={name}
              className={`h-1 flex-1 rounded-full ${position <= index ? 'bg-brand' : 'bg-surface-2'}`}
            />
          ))}
        </View>

        <Animated.View key={step} entering={FadeIn.duration(260)} style={{ flex: 1 }}>
          {step === 'voice' && <VoiceStep owner={owner} />}
          {step === 'rhythm' && <RhythmStep />}
          {step === 'agreement' && <AgreementStep />}
        </Animated.View>

        <View className="pb-9 pt-6">
          <Pressable
            onPress={next}
            accessibilityRole="button"
            className="min-h-tap items-center justify-center rounded-large bg-brand"
            style={SOFT}
          >
            <Text className="font-strong text-body text-brand-ink">
              {step === 'agreement' ? 'Combinado' : 'Continuar'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

function Title({ children, note }: { children: string; note: string }) {
  return (
    <>
      <Text className="mt-7 font-mid text-[27px] leading-[33px] tracking-[-0.9px] text-fg">
        {children}
      </Text>
      <Text className="mt-2.5 font-book text-[15px] leading-[22px] text-dim">{note}</Text>
    </>
  )
}

export function VoiceStep({ owner }: { owner?: string }) {
  return (
    <>
      <Title note="Toque em uma voz para ouvir. Dá para trocar depois, quando quiser.">
        Qual voz vai te acompanhar?
      </Title>
      <View className="mt-6">
        <VoicePicker owner={owner} />
      </View>
    </>
  )
}

export function VoicePicker({ owner }: { owner?: string }) {
  const voice = useApp(s => s.voice)
  const output = useApp(s => s.output)
  const setVoice = useApp(s => s.setVoice)
  const setOutput = useApp(s => s.setOutput)
  const [playing, setPlaying] = useState<VoiceChoice | null>(null)
  const silent = output === 'text'

  function choose(id: VoiceChoice) {
    setVoice(id)
    if (silent) setOutput('both')
    setPlaying(id)
    void previewVoice(id, voiceIntro(owner), () =>
      setPlaying(current => (current === id ? null : current))
    )
  }

  function chooseSilence() {
    stopVoice()
    setPlaying(null)
    setOutput('text')
    void Haptics.selectionAsync()
  }

  return (
    <View className="gap-2.5">
      {VOICES.map(option => {
        const on = !silent && option.id === voice
        return (
          <Pressable
            key={option.id}
            onPress={() => choose(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`Voz ${option.name}, ${option.description}`}
            className="min-h-tap flex-row items-center justify-between rounded-large bg-surface px-5 py-4"
            style={[SOFT, on ? { borderWidth: 2, borderColor: color.brand } : { borderWidth: 2, borderColor: 'transparent' }]}
          >
            <View className="flex-1 pr-3">
              <Text className="font-strong text-[17px] text-fg">{option.name}</Text>
              <Text className="mt-0.5 font-book text-note text-dim">{option.description}</Text>
            </View>
            <Text className={`font-strong text-hint ${on ? 'text-brand' : 'text-faint'}`}>
              {playing === option.id ? 'falando…' : on ? 'escolhida' : 'ouvir'}
            </Text>
          </Pressable>
        )
      })}

      <Pressable
        onPress={chooseSilence}
        accessibilityRole="radio"
        accessibilityState={{ selected: silent }}
        className="min-h-tap flex-row items-center justify-between rounded-large px-5 py-4"
        style={{ borderWidth: 2, borderColor: silent ? color.brand : color.line }}
      >
        <View className="flex-1 pr-3">
          <Text className="font-strong text-[17px] text-fg">Prefiro sem voz</Text>
          <Text className="mt-0.5 font-book text-note text-dim">
            a pista só aparece na tela e vibra
          </Text>
        </View>
        {silent && <Text className="font-strong text-hint text-brand">escolhida</Text>}
      </Pressable>
    </View>
  )
}

export function PatiencePicker() {
  const patience = useApp(s => s.patience)
  const setPatience = useApp(s => s.setPatience)

  return (
    <>
      <Segmented options={PATIENCE} value={patience} onChange={setPatience} />
      <Text className="mt-3 font-book text-hint leading-5 text-faint">
        {PATIENCE.find(option => option.value === patience)?.hint}
      </Text>
    </>
  )
}

function RhythmStep() {
  return (
    <>
      <Title note="Quando a palavra demora, quanto tempo eu espero antes de oferecer uma pista? Às vezes ela só precisa de um instante a mais.">
        No seu ritmo.
      </Title>
      <View className="mt-6">
        <PatiencePicker />
      </View>
    </>
  )
}

function AgreementStep() {
  return (
    <>
      <Title note="Antes de começar, o que eu prometo para você.">Combinado entre nós.</Title>
      <View className="mt-6 gap-3">
        {AGREEMENT.map(line => (
          <View key={line} className="flex-row gap-3 rounded-large bg-surface px-5 py-4" style={SOFT}>
            <View className="mt-[7px] size-2 rounded-full bg-brand" />
            <Text className="flex-1 font-mid text-[16px] leading-[23px] text-fg">{line}</Text>
          </View>
        ))}
      </View>
    </>
  )
}
