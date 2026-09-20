import { useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import Svg, { Circle, Line, Path, Polyline, Text as SvgText } from 'react-native-svg'
import { Screen } from '../components/ui'
import { AlertStrip } from '../components/AlertStrip'
import {
  KIND_LABEL,
  PATIENTS,
  drop,
  latest,
  type Patient,
  type PatientWord,
  type WordKind
} from '../domain/patients'
import { color, shadow } from '../theme/tokens'
import { TOP_INSET } from '../theme/insets'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const CHART_HEIGHT = 120
const SEGMENTS = 5

function comma(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

const KIND_PATH: Record<WordKind, string> = {
  person: 'M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M5.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5',
  place: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6',
  object: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  event: 'M5 6h14a1.6 1.6 0 0 1 1.6 1.6v11.8A1.6 1.6 0 0 1 19 21H5a1.6 1.6 0 0 1-1.6-1.6V7.6A1.6 1.6 0 0 1 5 6ZM3.4 11h17.2M8 3v4M16 3v4'
}

export function PatientScreen({
  id,
  onBack,
  onHaptics,
  onGraph
}: {
  id: string
  onBack: () => void
  onHaptics: () => void
  onGraph: () => void
}) {
  const [cardWidth, setCardWidth] = useState(0)
  const patient = PATIENTS.find(entry => entry.id === id) ?? PATIENTS[0]!
  const fell = drop(patient)

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
        <Text className="font-mid text-hint text-dim">Pacientes</Text>
      </Pressable>

      <View className="flex-row items-center gap-3.5">
        <Image
          source={patient.photo}
          style={{ width: 52, height: 52, borderRadius: 26 }}
          accessibilityIgnoresInvertColors
        />
        <View>
          <Text className="font-heavy text-[26px] leading-[31px] tracking-[-0.5px] text-fg">
            {patient.name}
          </Text>
          <Text className="mt-px font-book text-hint text-dim">em terapia {patient.since}</Text>
        </View>
      </View>

      {patient.alert && <AlertStrip alert={patient.alert} />}

      <View
        className="gap-2 rounded-panel bg-surface px-4 py-3.5"
        style={SOFT}
        onLayout={event => setCardWidth(event.nativeEvent.layout.width - 32)}
      >
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="font-book text-note text-dim">Degrau médio</Text>
            <Text className="font-heavy text-[30px] leading-[33px] tracking-[-0.6px] text-fg">
              {comma(latest(patient))}
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: color.goodSoft }}
          >
            <Svg viewBox="0 0 24 24" width={12} height={12}>
              <Path
                d="M12 5v14M6 13l6 6 6-6"
                fill="none"
                stroke={color.goodInk}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text className="font-strong text-note" style={{ color: color.goodInk }}>
              {comma(fell)} desde o início
            </Text>
          </View>
        </View>

        {cardWidth > 0 && <Weeks series={patient.trend} width={cardWidth} />}
      </View>

      <View className="mt-1 flex-row items-baseline justify-between">
        <Text className="font-heavy text-[15px] text-fg">Onde mais trava</Text>
        <Pressable onPress={onHaptics} hitSlop={8}>
          <Text className="font-strong text-[12.5px] text-brand">Ver todas</Text>
        </Pressable>
      </View>

      <View className="rounded-panel bg-surface px-3.5" style={SOFT}>
        {patient.words.map((word, index) => (
          <WordRow key={word.label} word={word} last={index === patient.words.length - 1} />
        ))}
      </View>

      <View className="mt-1 flex-row gap-2">
        <Action label="Ajustar pistas" muted path="M4 7h10M18 7h2M4 17h4M12 17h8" dots={[[16, 7], [10, 17]]} />
        <Action
          label="Ver grafo"
          onPress={onGraph}
          path="M8.3 7l7.3.7M7 8.3l2.2 7.4M16.3 9.8l-4.5 6.5"
          dots={[[6, 6], [18, 8], [10, 18]]}
        />
        <Action
          label="Relatório"
          onPress={onHaptics}
          path="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4"
        />
      </View>

      <View className="h-[104px]" />
    </Screen>
  )
}

function Weeks({ series, width }: { series: number[]; width: number }) {
  const x0 = 30
  const x1 = width - 10
  const top = 8
  const bottom = 98
  const y = (value: number) => top + ((5 - value) / 4) * (bottom - top)
  const span = Math.max(1, series.length - 1)
  const x = (index: number) => x0 + (index * (x1 - x0)) / span

  const points = series.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`)
  const area = `M${x0},${bottom} L${points.join(' L')} L${x1},${bottom} Z`
  const step = series.length > 6 ? 2 : 1

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      {[5, 3, 1].map(value => (
        <Line key={value} x1={18} y1={y(value)} x2={width} y2={y(value)} stroke={color.line} strokeWidth={1} />
      ))}
      {[5, 3, 1].map(value => (
        <SvgText key={`t${value}`} x={0} y={y(value) + 3.5} fontSize={10} fill={color.faint}>
          {String(value)}
        </SvgText>
      ))}

      <Path d={area} fill={color.brand} fillOpacity={0.08} />
      <Polyline
        points={points.join(' ')}
        fill="none"
        stroke={color.brand}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={x(span)}
        cy={y(series[span]!)}
        r={4}
        fill={color.brand}
        stroke={color.surface}
        strokeWidth={2}
      />

      {series.map((_, index) =>
        index % step === 0 || index === span ? (
          <SvgText
            key={`w${index}`}
            x={x(index)}
            y={118}
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

function WordRow({ word, last }: { word: PatientWord; last: boolean }) {
  const filled = Math.round(word.value)

  return (
    <View
      className="h-[52px] flex-row items-center gap-3"
      style={last ? undefined : { borderBottomWidth: 1, borderBottomColor: color.lineSoft }}
    >
      <View className="size-[30px] items-center justify-center rounded-[9px] bg-ink">
        <Svg viewBox="0 0 24 24" width={16} height={16}>
          <Path
            d={KIND_PATH[word.kind]}
            fill="none"
            stroke={color.brand}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View className="flex-1">
        <Text className="font-strong text-[15px] text-fg">{word.label}</Text>
        <Text className="font-book text-[11.5px] text-dim">{KIND_LABEL[word.kind]}</Text>
      </View>

      <View className="flex-row gap-[3px]">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 14,
              borderRadius: 3,
              backgroundColor: index < filled ? color.brand : color.line
            }}
          />
        ))}
      </View>

      <Text className="w-7 text-right font-heavy text-[15px] text-fg">{comma(word.value)}</Text>

      <Svg viewBox="0 0 24 24" width={14} height={14}>
        <Path
          d={word.up ? 'M12 19V5M6 11l6-6 6 6' : 'M12 5v14M6 13l6 6 6-6'}
          fill="none"
          stroke={word.up ? color.masteryMedium : color.masteryHigh}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

function Action({
  label,
  path,
  dots = [],
  onPress,
  muted = false
}: {
  label: string
  path: string
  dots?: number[][]
  onPress?: () => void
  muted?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={muted}
      accessibilityRole="button"
      accessibilityState={{ disabled: muted }}
      className="h-16 flex-1 items-center justify-center gap-1.5 rounded-large bg-surface"
      style={[SOFT, muted ? { opacity: 0.45 } : null]}
    >
      <Svg viewBox="0 0 24 24" width={20} height={20}>
        <Path d={path} fill="none" stroke={color.brand} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {dots.map(([cx, cy], index) => (
          <Circle key={index} cx={cx} cy={cy} r={2.5} fill="none" stroke={color.brand} strokeWidth={2} />
        ))}
      </Svg>
      <Text className="font-strong text-note text-fg">{label}</Text>
    </Pressable>
  )
}

export const PATIENT_TOP = TOP_INSET
