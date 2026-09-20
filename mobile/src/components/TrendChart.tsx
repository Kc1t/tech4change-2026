import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg'
import { color } from '../theme/tokens'

const PAD = { top: 14, right: 12, bottom: 14, left: 22 }

export function TrendChart({
  series,
  width,
  height = 150
}: {
  series: number[]
  width: number
  height?: number
}) {
  const span = Math.max(1, series.length - 1)
  const px = (index: number) => PAD.left + (index / span) * (width - PAD.left - PAD.right)
  const py = (value: number) => PAD.top + (1 - (value - 1) / 3) * (height - PAD.top - PAD.bottom)

  const line = series.map((value, index) => `${index === 0 ? 'M' : 'L'}${px(index)} ${py(value)}`)
  const base = height - PAD.bottom
  const area = `${line.join(' ')} L${px(span)} ${base} L${px(0)} ${base} Z`

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="trend" x1="0" y1={PAD.top} x2="0" y2={base} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color.brand} stopOpacity={0.24} />
          <Stop offset="1" stopColor={color.brand} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {[1, 2, 3, 4].map(value => (
        <Line
          key={value}
          x1={PAD.left}
          y1={py(value)}
          x2={width - PAD.right}
          y2={py(value)}
          stroke={color.line}
          strokeWidth={1}
        />
      ))}

      <Path d={area} fill="url(#trend)" />
      <Path d={line.join(' ')} fill="none" stroke={color.brand} strokeWidth={2} />
      <Circle
        cx={px(span)}
        cy={py(series[span]!)}
        r={4.5}
        fill={color.brand}
        stroke={color.surface}
        strokeWidth={2}
      />
    </Svg>
  )
}
