import { Pressable, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { color } from '../theme/tokens'
import type { Alert } from '../domain/patients'

export function AlertStrip({ alert }: { alert: Alert }) {
  const ready = alert.kind === 'ready'
  const tone = ready ? color.goodSoft : color.warnSoft
  const ink = ready ? color.goodInk : color.warnInk

  return (
    <View
      className="flex-row items-center gap-2.5 rounded-large p-2 pl-2.5"
      style={{ backgroundColor: tone }}
    >
      <View className="size-7 items-center justify-center rounded-[9px] bg-surface">
        <Svg viewBox="0 0 24 24" width={15} height={15}>
          {ready ? (
            <Path
              d="M4 7h4v4h4v4h4v4h4"
              fill="none"
              stroke={ink}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <Circle cx={12} cy={12} r={8.5} fill="none" stroke={ink} strokeWidth={2.2} />
              <Path
                d="M12 7.5V12l3 2"
                fill="none"
                stroke={ink}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
      </View>

      <Text className="flex-1 font-strong text-hint" style={{ color: ink }}>
        {alert.problem}
      </Text>

      <Pressable
        accessibilityRole="button"
        className="h-[34px] justify-center rounded-[10px] bg-surface px-3"
      >
        <Text className="font-heavy text-[12.5px]" style={{ color: ink }}>
          {alert.action}
        </Text>
      </Pressable>
    </View>
  )
}
