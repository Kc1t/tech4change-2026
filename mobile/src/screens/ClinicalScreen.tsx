import { Image, Pressable, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Path, Polyline } from 'react-native-svg'
import { AlertStrip } from '../components/AlertStrip'
import { BackButton, Screen, TopBar } from '../components/ui'
import {
  CLINIC,
  attention,
  caseloadAverage,
  latest,
  onPlan,
  type Patient
} from '../domain/patients'
import { color, shadow } from '../theme/tokens'

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

const SPARK = { width: 64, height: 26 }

function today(): string {
  const now = new Date()
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`
}

function comma(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}

export function ClinicalScreen({
  onBack,
  onOpen
}: {
  onBack: () => void
  onOpen: (id: string) => void
}) {
  const needsYou = attention()
  const steady = onPlan()

  return (
    <Screen>
      <TopBar left={<BackButton onPress={onBack} />} />

      <View className="flex-row items-end justify-between">
        <View>
          <Text className="font-book text-hint text-dim">{today()}</Text>
          <Text className="mt-0.5 font-heavy text-[28px] leading-[34px] tracking-[-0.6px] text-fg">
            Pacientes
          </Text>
        </View>
        <View className="size-11 items-center justify-center rounded-full bg-surface" style={SOFT}>
          <Svg viewBox="0 0 24 24" width={20} height={20}>
            <Circle cx={11} cy={11} r={6.5} fill="none" stroke={color.fg} strokeWidth={1.9} />
            <Path d="M16 16l4.5 4.5" stroke={color.fg} strokeWidth={1.9} strokeLinecap="round" />
          </Svg>
        </View>
      </View>

      <Banner />

      <Summary />

      <Section title="Pedem sua atenção" count={needsYou.length} tint={color.warnInk} />
      {needsYou.map(patient => (
        <AttentionCard key={patient.id} patient={patient} onPress={() => onOpen(patient.id)} />
      ))}

      <Section title="Seguindo o plano" count={steady.length} tint={color.dim} />
      {steady.map(patient => (
        <PlainRow key={patient.id} patient={patient} onPress={() => onOpen(patient.id)} />
      ))}

      <View className="h-[104px]" />
    </Screen>
  )
}

function Banner() {
  return (
    <View className="h-[112px] overflow-hidden rounded-panel bg-surface" style={SOFT}>
      <Image
        source={require('../../assets/fono.png')}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.97)']}
        locations={[0.16, 0.36, 0.52]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View className="flex-1 justify-center pl-[42%] pr-4">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-heavy text-[21px] leading-[26px] tracking-[-0.4px] text-brand">
            Bom dia!
          </Text>
          <Svg viewBox="0 0 24 24" width={17} height={17}>
            <Path
              d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"
              fill="none"
              stroke={color.brand}
              strokeWidth={1.7}
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text className="mt-1 font-book text-hint leading-[18px] text-fg">
          A fono Camila deixou uma mensagem para você.
        </Text>
      </View>
    </View>
  )
}

function Summary() {
  return (
    <View className="flex-row rounded-panel bg-surface py-3.5" style={SOFT}>
      <Stat
        value={comma(caseloadAverage())}
        label="degrau médio"
        direction="down"
        icon={
          <Path
            d="M4 19h4v-4h4v-4h4V7h4"
            fill="none"
            stroke={color.brand}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        }
      />
      <Stat
        value={`${CLINIC.active}`}
        suffix={`/${CLINIC.total}`}
        label="ativos"
        icon={
          <>
            <Circle cx={12} cy={8} r={3.5} fill="none" stroke={color.masteryMedium} strokeWidth={2.2} />
            <Path
              d="M5.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"
              fill="none"
              stroke={color.masteryMedium}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </>
        }
      />
      <Stat
        value={`${CLINIC.beforeSound}%`}
        label="sem pista sonora"
        direction="up"
        icon={
          <Path
            d="M11 5L6 9H3v6h3l5 4V5zM16 9l5 6M21 9l-5 6"
            fill="none"
            stroke={color.masteryHigh}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        }
      />
    </View>
  )
}

function Stat({
  value,
  suffix,
  label,
  icon,
  direction
}: {
  value: string
  suffix?: string
  label: string
  icon: React.ReactNode
  direction?: 'up' | 'down'
}) {
  return (
    <View
      className="flex-1 items-center gap-1"
      style={label === 'degrau médio' ? undefined : { borderLeftWidth: 1, borderLeftColor: color.line }}
    >
      <View className="flex-row items-center gap-1.5">
        <Svg viewBox="0 0 24 24" width={15} height={15}>
          {icon}
        </Svg>
        <Text className="font-heavy text-[21px] leading-[26px] tracking-[-0.4px] text-fg">
          {value}
          {suffix && <Text className="font-strong text-[14px] text-dim">{suffix}</Text>}
        </Text>
        {direction && (
          <Svg viewBox="0 0 24 24" width={11} height={11}>
            <Path
              d={direction === 'down' ? 'M12 5v14M6 13l6 6 6-6' : 'M12 19V5M6 11l6-6 6 6'}
              fill="none"
              stroke={color.masteryHigh}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
      <Text className="font-book text-[11.5px] text-dim">{label}</Text>
    </View>
  )
}

function Section({ title, count, tint }: { title: string; count: number; tint: string }) {
  return (
    <Text className="mt-1 font-heavy text-[15px] text-fg">
      {title} <Text style={{ color: tint }}>· {count}</Text>
    </Text>
  )
}

function Spark({ values }: { values: number[] }) {
  const { width, height } = SPARK
  const step = values.length === 1 ? 0 : (width - 8) / (values.length - 1)
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : 4 + index * step
    const y = 4 + ((5 - value) / 4) * (height - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const [lx, ly] = points[points.length - 1]!.split(',')

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points.join(' ')}
        fill="none"
        stroke={color.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={Number(lx)} cy={Number(ly)} r={2.8} fill={color.brand} />
    </Svg>
  )
}

function Identity({ patient }: { patient: Patient }) {
  return (
    <>
      <Image
        source={patient.photo}
        style={{ width: 40, height: 40, borderRadius: 20 }}
        accessibilityIgnoresInvertColors
      />
      <View className="min-w-0 flex-1">
        <Text className="font-strong text-[15px] text-fg">{patient.name}</Text>
        <Text
          className="mt-px font-book text-note"
          style={{ color: patient.noteIsGain ? color.masteryHigh : color.dim }}
        >
          {patient.note}
        </Text>
      </View>
      <Spark values={patient.trend} />
      <Text className="w-9 text-right font-heavy text-[20px] text-fg">
        {comma(latest(patient))}
      </Text>
    </>
  )
}

function AttentionCard({ patient, onPress }: { patient: Patient; onPress: () => void }) {
  const alert = patient.alert!

  return (
    <View className="gap-2.5 rounded-panel bg-surface p-3" style={SOFT}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${patient.name}, degrau médio ${comma(latest(patient))}`}
        className="min-h-tap flex-row items-center gap-3"
      >
        <Identity patient={patient} />
      </Pressable>

      <AlertStrip alert={alert} />
    </View>
  )
}

function PlainRow({ patient, onPress }: { patient: Patient; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, degrau médio ${comma(latest(patient))}`}
      className="min-h-tap flex-row items-center gap-3 rounded-panel bg-surface px-3.5 py-2.5"
      style={SOFT}
    >
      <Identity patient={patient} />
    </Pressable>
  )
}
