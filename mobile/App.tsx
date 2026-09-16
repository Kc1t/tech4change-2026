import { useCallback, useState } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts
} from '@expo-google-fonts/manrope'
import { BottomBar } from './src/components/BottomBar'
import { BodyScreen } from './src/screens/BodyScreen'
import { GraphScreen } from './src/screens/GraphScreen'
import { MemoriesScreen } from './src/screens/MemoriesScreen'
import { MomentScreen } from './src/screens/MomentScreen'
import { ProgressScreen } from './src/screens/ProgressScreen'
import { useSyncChannel } from './src/hooks/useSyncChannel'
import { HOME, type Route } from './src/navigation'
import { useApp } from './src/store'
import { color } from './src/theme/tokens'
import type { NodeId } from './src/domain/types'

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold
  })

  const [stack, setStack] = useState<Route[]>([HOME])
  useSyncChannel()
  const setMemoryFilter = useApp(s => s.setMemoryFilter)
  const route = stack[stack.length - 1]!

  const go = useCallback((next: Route) => {
    setStack(current => (current[current.length - 1] === next ? current : [...current, next]))
  }, [])

  const back = useCallback(() => {
    setStack(current => (current.length > 1 ? current.slice(0, -1) : current))
  }, [])

  const openMemories = useCallback(
    (id: NodeId | null) => {
      setMemoryFilter(id)
      go('memories')
    },
    [go, setMemoryFilter]
  )

  if (!fontsLoaded) return <View style={styles.screen} />

  return (
    <View style={styles.screen}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safe}>
        {route === 'moment' && <MomentScreen onBell={() => go('graph')} />}
        {route === 'graph' && <GraphScreen onOpenMemories={openMemories} />}
        {route === 'memories' && <MemoriesScreen onBack={back} />}
        {route === 'progress' && (
          <ProgressScreen onHome={() => go(HOME)} onBell={() => go('graph')} />
        )}
        {route === 'body' && <BodyScreen onBell={() => go('graph')} />}
      </SafeAreaView>

      <BottomBar
        route={route}
        onNavigate={next => {
          if (next === 'memories') setMemoryFilter(null)
          go(next)
        }}
        onHome={() => setStack([HOME])}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  safe: { flex: 1 }
})
