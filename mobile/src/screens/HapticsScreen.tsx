import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg'
import { Screen } from '../components/ui'
import { PATIENTS, gain, type Patient } from '../domain/patients'
import { color, shadow } from '../theme/tokens'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const MUTE = '#b3afc4'
const MUTE_LINE = '#d9d6e6'
const SCALE_MIN = 1
const SCALE_MAX = 5
const SCALE_HEIGHT = 72
const WEEK_HEIGHT = 128

const STRENGTHS = ['Leve', 'Média', 'Forte'] as const
type Strength = (typeof STRENGTHS)[number]

function comma(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

export function HapticsScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const [cardWidth, setCardWidth] = useState(0)
  const [on, setOn] = useState(true)
  const [strength, setStrength] = useState<Strength>('Média')
  const patient = PATIENTS.find(entry => entry.id === id) ?? PATIENTS[0]!
  const sessions = patient.sessionsWithHaptics + patient.sessionsWithoutHaptics

  return (
    <Screen gap={12}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        className="h-6 flex-row items-center gap-1"
        hitSlop={8}
      >
        <Svg viewBox="0 0 24 24" width={16} height={16}>
          <Path
            d="M15 6l-6 6 6 6"
            fill="none"
            stroke={color.dim}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text className="font-mid text-hint text-dim">{patient.name}</Text>
      </Pressable>

      <View className="gap-0.5">
        <Text className="font-heavy text-[24px] leading-[29px] tracking-[-0.5px] text-fg">
          Com e sem vibração
        </Text>
        <Text className="font-book text-hint text-dim">
          {sessions} sessões · {patient.sessionsWithHaptics} com,{' '}
          {patient.sessionsWithoutHaptics} sem
        </Text>
      </View>

      <View
        className="gap-1.5 rounded-panel bg-surface px-4 py-3.5"
        style={SOFT}
        onLayout={event => setCardWidth(event.nativeEvent.layout.width - 32)}
      >
        <View className="flex-row items-baseline gap-2">
          <Text className="font-heavy text-[30px] leading-[33px] tracking-[-0.6px] text-brand">
            {comma(gain(patient))}
          </Text>
          <Text className="flex-1 font-book text-hint text-dim">
            degrau a menos com vibração
          </Text>
        </View>

        {cardWidth > 0 && <Scale patient={patient} width={cardWidth} />}
      </View>

      <View className="gap-2 rounded-panel bg-surface px-4 py-3.5" style={SOFT}>
        <View className="flex-row items-center justify-between">
          <Text className="font-heavy text-body text-fg">Semana a semana</Text>
          <View className="flex-row gap-2.5">
            <Key tint={color.brand} label="com" />
            <Key tint={MUTE} label="sem" />
          </View>
        </View>

        {cardWidth > 0 && <Weeks patient={patient} width={cardWidth} />}
      </View>

      <View
        className="flex-row items-center gap-2.5 rounded-large px-3 py-2.5"
        style={{ backgroundColor: color.brandSoft }}
      >
        <Svg viewBox="0 0 24 24" width={18} height={18}>
          <Circle cx={12} cy={12} r={8.5} fill="none" stroke={color.brand} strokeWidth={2.2} />
          <Path
            d="M12 11v5M12 8h.01"
            fill="none"
            stroke={color.brand}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
        <Text className="flex-1 font-book text-note text-dim">
          Tendência, não prova: poucas sessões e sem sorteio.
        </Text>
      </View>

      <View className="gap-3 rounded-panel bg-surface px-4 py-3.5" style={SOFT}>
        <View className="flex-row items-center justify-between">
          <Text className="font-heavy text-body text-fg">Vibração para {patient.name}</Text>
          <Switch on={on} onToggle={() => setOn(current => !current)} />
        </View>

        <View
          className="flex-row gap-1 rounded-card p-1"
          style={{ backgroundColor: color.ink, opacity: on ? 1 : 0.45 }}
        >
          {STRENGTHS.map(option => (
            <Pressable
              key={option}
              onPress={() => setStrength(option)}
              disabled={!on}
              accessibilityRole="button"
              accessibilityState={{ selected: option === strength, disabled: !on }}
              className="flex-1 items-center justify-center rounded-[9px]"
              style={[
                { height: 34 },
                option === strength ? { backgroundColor: color.surface, ...SOFT } : null
              ]}
            >
              <Text
                className={option === strength ? 'font-heavy text-note text-fg' : 'font-book text-note text-dim'}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="h-[104px]" />
    </Screen>
  )
}

function Key({ tint, label }: { tint: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tint }} />
      <Text className="font-book text-[11.5px] text-dim">{label}</Text>
    </View>
  )
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={on ? 'Vibração ligada' : 'Vibração desligada'}
      hitSlop={8}
      style={{
        width: 48,
        height: 28,
        borderRadius: 999,
        padding: 3,
        justifyContent: 'center',
        alignItems: on ? 'flex-end' : 'flex-start',
        backgroundColor: on ? color.brand : color.line
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color.surface }} />
    </Pressable>
  )
}

function Scale({ patient, width }: { patient: Patient; width: number }) {
  const x0 = 10
  const x1 = width - 10
  const axis = 46
  const at = (value: number) =>
    x0 + ((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * (x1 - x0)
  const onX = at(patient.withHaptics)
  const offX = at(patient.withoutHaptics)

  return (
    <Svg width={width} height={SCALE_HEIGHT}>
      <Line x1={x0} y1={axis} x2={x1} y2={axis} stroke={color.line} strokeWidth={4} strokeLinecap="round" />

      {[1, 2, 3, 4, 5].map(value => (
        <SvgText
          key={value}
          x={at(value)}
          y={66}
          fontSize={10}
          fill={color.faint}
          textAnchor="middle"
        >
          {String(value)}
        </SvgText>
      ))}

      <Line
        x1={onX}
        y1={axis}
        x2={offX}
        y2={axis}
        stroke={color.brand}
        strokeWidth={4}
        strokeOpacity={0.35}
        strokeLinecap="round"
      />
      <Circle cx={offX} cy={axis} r={7} fill={MUTE} stroke={color.surface} strokeWidth={2} />
      <Circle cx={onX} cy={axis} r={7} fill={color.brand} stroke={color.surface} strokeWidth={2} />

      <SvgText x={onX} y={26} fontSize={12} fontWeight="700" fill={color.brand} textAnchor="middle">
        {`com ${comma(patient.withHaptics)}`}
      </SvgText>
      <SvgText x={offX} y={26} fontSize={12} fontWeight="700" fill={color.faint} textAnchor="middle">
        {`sem ${comma(patient.withoutHaptics)}`}
      </SvgText>
    </Svg>
  )
}

function Weeks({ patient, width }: { patient: Patient; width: number }) {
  const top = 8
  const bottom = 100
  const y = (value: number) => top + ((5 - value) / 4) * (bottom - top)
  const weeks = patient.trend.length
  const slot = (width - 16) / weeks
  const x = (index: number) => 16 + slot * (index + 0.5)
  const step = weeks > 6 ? 2 : 1

  return (
    <Svg width={width} height={WEEK_HEIGHT}>
      {[5, 3, 1].map(value => (
        <Line
          key={value}
          x1={16}
          y1={y(value)}
          x2={width}
          y2={y(value)}
          stroke={color.lineSoft}
          strokeWidth={1}
        />
      ))}
      {[5, 3, 1].map(value => (
        <SvgText key={`t${value}`} x={0} y={y(value) + 3.5} fontSize={10} fill={color.faint}>
          {String(value)}
        </SvgText>
      ))}

      {patient.trend.map((value, index) => (
        <Line
          key={`b${index}`}
          x1={x(index)}
          y1={y(patient.trendWithout[index] ?? value)}
          x2={x(index)}
          y2={y(value)}
          stroke={MUTE_LINE}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      {patient.trend.map((value, index) => (
        <Circle
          key={`o${index}`}
          cx={x(index)}
          cy={y(patient.trendWithout[index] ?? value)}
          r={5}
          fill={MUTE}
        />
      ))}
      {patient.trend.map((value, index) => (
        <Circle key={`n${index}`} cx={x(index)} cy={y(value)} r={5} fill={color.brand} />
      ))}

      {patient.trend.map((_, index) =>
        index % step === 0 || index === weeks - 1 ? (
          <SvgText
            key={`w${index}`}
            x={x(index)}
            y={124}
            fontSize={10}
            fill={color.faint}
            textAnchor="middle"
          >
            {`S${index + 1}`}
          </SvgText>
        ) : null
      )}
    </Svg>
  )
}
