import { Pressable, Text, View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { color, shadow } from '../theme/tokens'
import { BAR_INSET } from '../theme/insets'

type TabKey = 'patients' | 'agenda' | 'reports' | 'settings'

const TABS: Array<{ key: TabKey; label: string; live: boolean }> = [
  { key: 'patients', label: 'Pacientes', live: true },
  { key: 'agenda', label: 'Agenda', live: false },
  { key: 'reports', label: 'Relatórios', live: false },
  { key: 'settings', label: 'Ajustes', live: true }
]

function Glyph({ tab, tint }: { tab: TabKey; tint: string }) {
  const stroke = { fill: 'none', stroke: tint, strokeWidth: 1.8, strokeLinecap: 'round' as const }

  return (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      {tab === 'patients' && (
        <>
          <Circle cx={9} cy={8} r={3.5} {...stroke} />
          <Path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" {...stroke} strokeLinejoin="round" />
          <Path d="M16 4.8a3.3 3.3 0 0 1 0 6.4" {...stroke} />
          <Path d="M18 14.8c1.8.7 3 2.4 3.5 5.2" {...stroke} />
        </>
      )}
      {tab === 'agenda' && (
        <>
          <Rect x={3.5} y={5} width={17} height={15.5} rx={3} {...stroke} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" {...stroke} />
        </>
      )}
      {tab === 'reports' && <Path d="M5 20V11M12 20V5M19 20v-6" {...stroke} />}
      {tab === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
            {...stroke}
          />
        </>
      )}
    </Svg>
  )
}

export function ClinicianBar({
  active,
  onPatients,
  onLeave
}: {
  active: TabKey
  onPatients: () => void
  onLeave: () => void
}) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 z-30 px-4"
      style={{ paddingBottom: BAR_INSET }}
      pointerEvents="box-none"
    >
      <View className="flex-row rounded-[22px] bg-surface" style={[shadow.bar, { height: 64 }]}>
        {TABS.map(tab => {
          const on = tab.key === active
          const tint = on ? color.brand : color.dim

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: on, disabled: !tab.live }}
              disabled={!tab.live}
              onPress={tab.key === 'patients' ? onPatients : onLeave}
              className="flex-1 items-center justify-center gap-[3px]"
              style={tab.live ? undefined : { opacity: 0.45 }}
            >
              <Glyph tab={tab.key} tint={tint} />
              <Text
                className={`text-[11px] ${on ? 'font-strong' : 'font-book'}`}
                style={{ color: tint }}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
