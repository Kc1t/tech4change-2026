import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { AuroraField } from '../components/AuroraField'
import { BrandMark } from '../components/ui'
import { SEED_QUESTIONS, clean, isComplete, type Seed, type SeedKey } from '../domain/seed'
import { TOUR } from '../domain/tour'
import { color, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }

export function OnboardingScreen({
  onDone,
  onExample,
  prefill,
  auto = false
}: {
  onDone: (seed: Seed) => void
  onExample: () => void
  prefill?: Partial<Seed>
  auto?: boolean
}) {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Seed>>(prefill ?? {})
  const [typed, setTyped] = useState(prefill?.owner ?? '')
  const field = useRef<TextInput>(null)

  const step = SEED_QUESTIONS[index]!
  const last = index === SEED_QUESTIONS.length - 1
  const filled = clean(typed).length > 0

  function move(next: number) {
    setIndex(next)
    setTyped(answers[SEED_QUESTIONS[next]!.key] ?? prefill?.[SEED_QUESTIONS[next]!.key] ?? '')
  }

  function commit(value: string) {
    const next = { ...answers, [step.key as SeedKey]: clean(value) || undefined }
    setAnswers(next)

    if (last) {
      if (isComplete(next)) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onDone(next as Seed)
      }
      return
    }

    void Haptics.selectionAsync()
    setIndex(index + 1)
    setTyped(answers[SEED_QUESTIONS[index + 1]!.key] ?? prefill?.[SEED_QUESTIONS[index + 1]!.key] ?? '')
  }

  const commitRef = useRef(commit)
  commitRef.current = commit

  useEffect(() => {
    if (!auto || started) return
    const timer = setTimeout(() => setStarted(true), TOUR.welcomeMs)
    return () => clearTimeout(timer)
  }, [auto, started])

  useEffect(() => {
    if (!auto || !started) return

    const target = prefill?.[step.key] ?? ''
    let written = 0
    let stroke: ReturnType<typeof setInterval> | null = null
    let hold: ReturnType<typeof setTimeout> | null = null

    setTyped('')

    const read = setTimeout(() => {
      stroke = setInterval(() => {
        written += 1
        setTyped(target.slice(0, written))

        if (written < target.length) return
        if (stroke) clearInterval(stroke)
        hold = setTimeout(() => commitRef.current(target), TOUR.holdMs)
      }, TOUR.typeMs)
    }, TOUR.readMs)

    return () => {
      clearTimeout(read)
      if (stroke) clearInterval(stroke)
      if (hold) clearTimeout(hold)
    }
  }, [auto, started, index, prefill, step.key])

  if (!started) {
    return <Welcome onStart={() => setStarted(true)} onExample={onExample} />
  }

  return (
    <View className="flex-1 bg-ink">
      <View className="absolute inset-x-0 bottom-0 h-[34%] opacity-70">
        <AuroraField state="listening" level={0.18} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingTop: TOP_INSET, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="h-11 flex-row items-center justify-between">
            <BrandMark />
            {index > 0 && (
              <Pressable
                onPress={() => move(index - 1)}
                hitSlop={8}
                className="min-h-tap justify-center px-2"
              >
                <Text className="font-strong text-hint text-dim">Voltar</Text>
              </Pressable>
            )}
          </View>

          <Progress index={index} />

          <Animated.View key={step.key} entering={FadeIn.duration(260)}>
            <Text className="mt-7 font-mid text-[27px] leading-[33px] tracking-[-0.9px] text-fg">
              {step.question}
            </Text>

            <Text className="mt-2.5 font-book text-[15px] leading-[22px] text-dim">
              {step.note}
            </Text>

            <TextInput
              ref={field}
              value={typed}
              onChangeText={setTyped}
              editable={!auto}
              onSubmitEditing={() => filled && commit(typed)}
              placeholder={step.placeholder}
              placeholderTextColor={color.faint}
              accessibilityLabel={step.question}
              autoCapitalize="words"
              returnKeyType={last ? 'done' : 'next'}
              className="mt-6 min-h-tap rounded-large bg-surface px-5 font-mid text-[18px] text-fg"
              style={SOFT}
            />

            <Pressable
              onPress={() => commit(typed)}
              disabled={!filled}
              accessibilityRole="button"
              className={`mt-3 min-h-tap items-center justify-center rounded-large ${
                filled ? 'bg-brand' : 'bg-surface-2'
              }`}
            >
              <Text
                className={`font-strong text-body ${filled ? 'text-brand-ink' : 'text-faint'}`}
              >
                {last ? 'Montar o meu mapa' : 'Continuar'}
              </Text>
            </Pressable>

            {step.optional && (
              <Pressable
                onPress={() => commit('')}
                className="mt-1 min-h-tap items-center justify-center"
              >
                <Text className="font-strong text-hint text-faint">Pular esta</Text>
              </Pressable>
            )}
          </Animated.View>

          <Text className="mt-auto pb-7 pt-8 font-book text-note leading-[18px] text-dim">
            Estas respostas ficam neste aparelho. Nenhuma delas é enviada para lugar nenhum.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

function Progress({ index }: { index: number }) {
  return (
    <View className="mt-7">
      <View className="flex-row gap-1.5">
        {SEED_QUESTIONS.map((question, position) => (
          <Segment key={question.key} done={position <= index} />
        ))}
      </View>
      <Text className="mt-3 font-strong text-caps text-label">
        {index + 1} DE {SEED_QUESTIONS.length}
      </Text>
    </View>
  )
}

function Segment({ done }: { done: boolean }) {
  const fill = useSharedValue(done ? 1 : 0)

  useEffect(() => {
    fill.value = withTiming(done ? 1 : 0, {
      duration: 340,
      easing: Easing.bezier(0.22, 1, 0.36, 1)
    })
  }, [done, fill])

  const style = useAnimatedStyle(() => ({ opacity: fill.value }))

  return (
    <View className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
      <Animated.View
        style={[
          { width: '100%', height: '100%', borderRadius: 999, backgroundColor: color.brand },
          style
        ]}
      />
    </View>
  )
}

function Welcome({ onStart, onExample }: { onStart: () => void; onExample: () => void }) {
  return (
    <View className="flex-1 bg-ink">
      <View className="absolute inset-x-0 bottom-0 h-[46%]">
        <AuroraField state="listening" level={0.3} />
      </View>

      <View className="flex-1 px-6" style={{ paddingTop: TOP_INSET }}>
        <View className="h-11 justify-center">
          <BrandMark />
        </View>

        <Animated.View
          entering={FadeIn.duration(420)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Text className="font-mid text-[32px] leading-[38px] tracking-[-1.2px] text-fg">
            Vamos montar o seu mapa.
          </Text>

          <Text className="mt-4 max-w-[320px] font-book text-[16px] leading-[24px] text-dim">
            Seis perguntas curtas sobre as pessoas e as coisas do seu dia. É com elas que o Eilo
            alcança a palavra quando ela trava.
          </Text>

          <Text className="mt-3 font-book text-note leading-[18px] text-faint">
            Pode pular as que não vierem. Leva menos de um minuto.
          </Text>
        </Animated.View>

        <View className="pb-9">
          <Pressable
            onPress={onStart}
            accessibilityRole="button"
            className="min-h-tap items-center justify-center rounded-large bg-brand"
            style={SOFT}
          >
            <Text className="font-strong text-body text-brand-ink">Começar</Text>
          </Pressable>

          <Pressable
            onPress={onExample}
            accessibilityRole="button"
            className="mt-2 min-h-tap items-center justify-center"
          >
            <Text className="font-strong text-hint text-brand">Ver com um exemplo pronto</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
