import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Segmented } from './ui'
import { PATIENCE, VOICES, voiceIntro, type VoiceChoice } from '../domain/comfort'
import { useApp } from '../store'
import { previewVoice, stopVoice } from '../voice'
import { color, shadow } from '../theme/tokens'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }

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
