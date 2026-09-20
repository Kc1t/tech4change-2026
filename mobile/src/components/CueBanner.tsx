import { Text, View } from 'react-native'
import { useCueReceiver } from '../hooks/useCueReceiver'
import { lifeGraph } from '../store'
import { shadow } from '../theme/tokens'
import { BAR_INSET } from '../theme/insets'

export function CueBanner() {
  const cue = useCueReceiver()
  if (!cue) return null

  const node = lifeGraph.nodes[cue.targetId]
  const text = cue.isFinal
    ? (node?.phon?.firstSyllable ? `${node.phon.firstSyllable}…` : 'a palavra')
    : (node?.attrs[cue.attr] ?? 'uma dica')

  return (
    <View
      className="absolute inset-x-6 z-40 flex-row items-center gap-3 rounded-large bg-fg px-4 py-3"
      style={{ bottom: BAR_INSET + 86, ...shadow.bar }}
      pointerEvents="none"
    >
      <View className="size-2 rounded-full bg-brand-warm" />
      <View className="flex-1">
        <Text className="font-strong text-caps text-ink/60">
          {cue.isFinal ? 'A PALAVRA' : `DEGRAU ${cue.level}`}
        </Text>
        <Text className="mt-0.5 font-strong text-body text-ink" numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  )
}
