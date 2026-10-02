import { useCallback, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { Buddy, type BuddyMood } from '../components/Buddy'
import { Typed } from '../components/Typed'
import { BrandMark } from '../components/ui'
import { onboardingTurn } from '../api/client'
import { VOICES, voiceIntro, type VoiceChoice } from '../domain/comfort'
import {
  SUGGESTIONS,
  isOptional,
  nextAsk,
  parseLocally,
  questionFor,
  scriptFor,
  tidy,
  warmReply,
  type Ask
} from '../domain/onboarding'
import { isComplete, type Seed, type SeedKey } from '../domain/seed'
import { TOUR } from '../domain/tour'
import { useApp } from '../store'
import { previewVoice, stopVoice } from '../voice'
import { color, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const FACT_ORDER: SeedKey[] = ['owner', 'person', 'place', 'activity', 'object']
const MISSED = 'Não peguei direito. Pode escrever de outro jeito?'

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
  const [answers, setAnswers] = useState<Partial<Seed>>({})
  const [skipped, setSkipped] = useState<Set<Ask>>(new Set())
  const [reply, setReply] = useState('Oi, eu sou o eilo.')
  const [typed, setTyped] = useState('')
  const [thinking, setThinking] = useState(false)
  const ask = nextAsk(answers, skipped)
  const question = ask ? questionFor(ask, answers) : 'Última coisa: qual voz vai te acompanhar?'

  const submit = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || thinking || !ask) return

      setTyped('')
      setThinking(true)
      void Haptics.selectionAsync()

      const remote = auto ? null : await onboardingTurn({ message, asked: question, known: answers })
      const fromModel = remote ? tidy(remote.answers, answers) : {}
      const found = Object.keys(fromModel).length > 0 ? fromModel : parseLocally(message, ask, answers)
      const understood = Object.keys(found).length > 0

      setThinking(false)
      setAnswers(current => ({ ...current, ...found }))

      if (!understood && isOptional(ask)) {
        setSkipped(current => new Set(current).add(ask))
        setReply('Tudo bem, fica para depois.')
        return
      }

      setReply(understood ? remote?.reply || warmReply(found) : MISSED)
    },
    [thinking, ask, auto, question, answers]
  )

  function skip() {
    if (!ask) return
    setSkipped(current => new Set(current).add(ask))
    setReply('Tudo bem, fica para depois.')
  }

  function forget(key: SeedKey) {
    void Haptics.selectionAsync()
    setAnswers(current => {
      const next = { ...current }
      delete next[key]
      if (key === 'person') delete next.relation
      return next
    })
    setReply('Sem problema, vamos de novo.')
  }

  function finish() {
    stopVoice()
    if (!isComplete(answers)) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onDone(answers as Seed)
  }

  const submitRef = useRef(submit)
  submitRef.current = submit
  const finishRef = useRef(finish)
  finishRef.current = finish
  const turn = useRef(0)

  useEffect(() => {
    if (!auto || thinking) return
    const script = scriptFor(prefill ?? {})

    if (!ask) {
      const timer = setTimeout(() => finishRef.current(), TOUR.readMs + TOUR.holdMs * 2)
      return () => clearTimeout(timer)
    }

    const line = script[turn.current]
    if (!line) return
    let written = 0
    let stroke: ReturnType<typeof setInterval> | null = null
    let hold: ReturnType<typeof setTimeout> | null = null

    const read = setTimeout(() => {
      stroke = setInterval(() => {
        written += 1
        setTyped(line.slice(0, written))
        if (written < line.length) return
        if (stroke) clearInterval(stroke)
        hold = setTimeout(() => {
          turn.current += 1
          void submitRef.current(line)
        }, TOUR.holdMs)
      }, TOUR.typeMs)
    }, turn.current === 0 ? TOUR.welcomeMs : TOUR.readMs * 2)

    return () => {
      clearTimeout(read)
      if (stroke) clearInterval(stroke)
      if (hold) clearTimeout(hold)
    }
  }, [auto, ask, thinking, prefill])

  const mood: BuddyMood = !ask ? 'happy' : thinking ? 'guess' : typed ? 'listening' : 'speaking'
  const facts = FACT_ORDER.filter(key => answers[key])
  const suggestions = ask ? SUGGESTIONS[ask] : []

  return (
    <View className="flex-1 bg-ink">
      <Glow />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingTop: TOP_INSET, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="h-11 flex-row items-center justify-between">
            <BrandMark />
            {ask === 'intro' && !auto && (
              <Pressable onPress={onExample} hitSlop={8} className="min-h-tap justify-center px-2">
                <Text className="font-strong text-hint text-brand">Ver um exemplo</Text>
              </Pressable>
            )}
          </View>

          <View className="flex-1 items-center justify-center py-6">
            <Buddy size={72} mood={mood} />

            <Animated.Text
              key={reply}
              entering={FadeIn.duration(320)}
              className="mt-5 text-center font-book text-[15px] leading-[22px] text-dim"
            >
              {thinking ? 'Deixa eu ver…' : reply}
            </Animated.Text>

            <Typed
              text={question}
              className="mt-2 max-w-[320px] text-center font-mid text-[26px] leading-[32px] tracking-[-0.8px] text-fg"
            />

            {facts.length > 0 && (
              <Animated.View
                layout={LinearTransition}
                style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 340 }}
              >
                {facts.map(key => (
                  <Animated.View key={key} entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)}>
                    <Pressable
                      onPress={() => forget(key)}
                      disabled={auto}
                      accessibilityRole="button"
                      accessibilityLabel={`Corrigir ${answers[key]}`}
                      className="flex-row items-center gap-1.5 rounded-full bg-surface py-2 pl-3.5 pr-2.5"
                      style={SOFT}
                    >
                      <Text className="font-strong text-[14px] text-fg">
                        {answers[key]}
                        {key === 'person' && answers.relation ? (
                          <Text className="font-book text-dim"> · {answers.relation}</Text>
                        ) : null}
                      </Text>
                      <Svg width={14} height={14} viewBox="0 0 14 14">
                        <Path d="M4 4l6 6M10 4l-6 6" stroke={color.faint} strokeWidth={1.6} strokeLinecap="round" />
                      </Svg>
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </View>

          <View className="pb-7">
            {ask ? (
              <>
                {(suggestions.length > 0 || isOptional(ask)) && (
                  <View className="mb-3 flex-row flex-wrap justify-center gap-2">
                    {suggestions.map(option => (
                      <Pressable
                        key={option}
                        onPress={() => void submit(option)}
                        disabled={thinking || auto}
                        className="rounded-full bg-brand-soft px-3.5 py-2"
                      >
                        <Text className="font-strong text-[14px] text-brand">{option}</Text>
                      </Pressable>
                    ))}
                    {isOptional(ask) && (
                      <Pressable onPress={skip} disabled={thinking || auto} className="rounded-full px-3.5 py-2">
                        <Text className="font-strong text-[14px] text-faint">Pular</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                <Composer
                  value={typed}
                  onChange={setTyped}
                  onSend={() => void submit(typed)}
                  busy={thinking}
                  editable={!auto}
                  label={question}
                />
              </>
            ) : (
              <VoiceChoices owner={answers.owner} onStart={finish} />
            )}

            <Text className="mt-4 text-center font-book text-note leading-[18px] text-faint">
              Suas respostas ficam neste aparelho. A IA só ajuda a organizar o que você contou.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

function Composer({
  value,
  onChange,
  onSend,
  busy,
  editable,
  label
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  busy: boolean
  editable: boolean
  label: string
}) {
  const ready = value.trim().length > 0 && !busy

  return (
    <View className="min-h-tap flex-row items-center rounded-full bg-surface pl-5 pr-1.5" style={SOFT}>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable && !busy}
        onSubmitEditing={onSend}
        placeholder="Escreva do seu jeito"
        placeholderTextColor={color.faint}
        accessibilityLabel={label}
        returnKeyType="send"
        className="min-h-tap flex-1 py-3 font-mid text-[17px] text-fg"
      />
      <Pressable
        onPress={onSend}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityLabel="Enviar"
        className={`size-11 items-center justify-center rounded-full ${ready ? 'bg-brand' : 'bg-surface-2'}`}
      >
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Path
            d="M9 14V4M4.5 8.5L9 4l4.5 4.5"
            stroke={ready ? color.brandInk : color.faint}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Pressable>
    </View>
  )
}

function VoiceChoices({ owner, onStart }: { owner?: string; onStart: () => void }) {
  const voice = useApp(s => s.voice)
  const output = useApp(s => s.output)
  const setVoice = useApp(s => s.setVoice)
  const setOutput = useApp(s => s.setOutput)
  const silent = output === 'text'

  function choose(id: VoiceChoice) {
    void Haptics.selectionAsync()
    setVoice(id)
    if (silent) setOutput('both')
    void previewVoice(id, voiceIntro(owner), () => undefined)
  }

  function chooseSilence() {
    void Haptics.selectionAsync()
    stopVoice()
    setOutput('text')
  }

  return (
    <Animated.View entering={FadeIn.duration(320)}>
      <View className="mb-4 flex-row flex-wrap justify-center gap-2">
        {VOICES.map(option => {
          const on = !silent && option.id === voice
          return (
            <Pressable
              key={option.id}
              onPress={() => choose(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Voz ${option.name}, ${option.description}`}
              className={`rounded-full px-4 py-2.5 ${on ? 'bg-brand' : 'bg-surface'}`}
              style={on ? undefined : SOFT}
            >
              <Text className={`font-strong text-[15px] ${on ? 'text-brand-ink' : 'text-fg'}`}>{option.name}</Text>
            </Pressable>
          )
        })}
        <Pressable
          onPress={chooseSilence}
          accessibilityRole="radio"
          accessibilityState={{ selected: silent }}
          className={`rounded-full px-4 py-2.5 ${silent ? 'bg-brand' : ''}`}
          style={silent ? undefined : { borderWidth: 1.5, borderColor: color.line }}
        >
          <Text className={`font-strong text-[15px] ${silent ? 'text-brand-ink' : 'text-dim'}`}>Sem voz</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        className="min-h-tap items-center justify-center rounded-full bg-brand"
        style={SOFT}
      >
        <Text className="font-strong text-body text-brand-ink">Começar</Text>
      </Pressable>
    </Animated.View>
  )
}

function Glow() {
  const { width, height } = useWindowDimensions()

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="onboarding-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color.aurora1} stopOpacity="0.38" />
            <Stop offset="0.6" stopColor={color.aurora3} stopOpacity="0.12" />
            <Stop offset="1" stopColor={color.aurora3} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width / 2} cy={height * 0.34} rx={width * 0.75} ry={height * 0.26} fill="url(#onboarding-glow)" />
      </Svg>
    </View>
  )
}
