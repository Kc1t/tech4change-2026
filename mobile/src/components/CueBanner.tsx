import { Text, View } from 'react-native'
import { useCueReceiver } from '../hooks/useCueReceiver'
import { lifeGraph } from '../store'
import { shadow } from '../theme/tokens'
import { BAR_INSET } from '../theme/insets'
import type { CuePayload } from '../sync/client'

function bannerFor(cue: CuePayload): { caption: string; text: string } {
  const node = lifeGraph.nodes[cue.targetId]

  if (cue.event === 'resolved') return { caption: 'ACHOU', text: node?.label ?? 'a palavra' }

  if (cue.isFinal) {
    const syllable = node?.phon?.firstSyllable
    return { caption: 'A PALAVRA', text: syllable ? `${syllable}…` : 'a palavra' }
  }

  return { caption: `DEGRAU ${cue.level}`, text: node?.attrs[cue.attr] ?? 'uma dica' }
}

export function CueBanner() {
  const cue = useCueReceiver()
  if (!cue) return null

  const { caption, text } = bannerFor(cue)

  return (
    <View
      className="absolute inset-x-6 z-40 flex-row items-center gap-3 rounded-large bg-fg px-4 py-3"
      style={{ bottom: BAR_INSET + 86, ...shadow.bar }}
      pointerEvents="none"
    >
      <View className="size-2 rounded-full bg-brand-warm" />
      <View className="flex-1">
        <Text className="font-strong text-caps text-ink/60">{caption}</Text>
        <Text className="mt-0.5 font-strong text-body text-ink" numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  )
}
