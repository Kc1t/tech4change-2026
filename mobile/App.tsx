import './global.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LogBox, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts
} from '@expo-google-fonts/manrope'
import { BottomBar } from './src/components/BottomBar'
import { ClinicianBar } from './src/components/ClinicianBar'
import { CueBanner } from './src/components/CueBanner'
import { Splash } from './src/components/Splash'
import { BodyScreen } from './src/screens/BodyScreen'
import { ClinicalScreen } from './src/screens/ClinicalScreen'
import { HapticsScreen } from './src/screens/HapticsScreen'
import { PatientScreen } from './src/screens/PatientScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { GraphScreen } from './src/screens/GraphScreen'
import { MemoriesScreen } from './src/screens/MemoriesScreen'
import { MomentScreen } from './src/screens/MomentScreen'
import { ProgressScreen } from './src/screens/ProgressScreen'
import { useSyncChannel } from './src/hooks/useSyncChannel'
import { CLINIC_ROUTES, HOME, type Route } from './src/navigation'
import { installSeed, useApp } from './src/store'
import { DEMO_SEED, buildSeedGraph, type Seed } from './src/domain/seed'
import { forgetSeed, readSeed, saveSeed } from './src/domain/seedStore'
import { DEMO_MS, TOUR, TOUR_PATIENT, TOUR_STOPS } from './src/domain/tour'
import type { NodeId } from './src/domain/types'

LogBox.ignoreAllLogs()

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold
  })

  const [stack, setStack] = useState<Route[]>([HOME])
  const [patientId, setPatientId] = useState('helena')
  const [booted, setBooted] = useState(false)
  const [needsSeed, setNeedsSeed] = useState(false)
  const [prefill, setPrefill] = useState<Partial<Seed> | undefined>(undefined)
  const [demoPending, setDemoPending] = useState(false)
  const [splash, setSplash] = useState(false)
  const [touring, setTouring] = useState(false)
  const walk = useRef<Array<ReturnType<typeof setTimeout>>>([])
  const sync = useSyncChannel()

  const stopWalk = useCallback(() => {
    walk.current.forEach(clearTimeout)
    walk.current = []
  }, [])

  useEffect(() => stopWalk, [stopWalk])

  useEffect(() => {
    let alive = true

    void readSeed().then(async seed => {
      if (!alive) return
      if (seed) {
        const { graph, scenes } = await buildSeedGraph(seed)
        if (!alive) return
        installSeed(graph, scenes)
      } else {
        setNeedsSeed(true)
      }
      setBooted(true)
    })

    return () => {
      alive = false
    }
  }, [])

  const leaveOnboarding = useCallback(() => {
    setPrefill(undefined)
    setNeedsSeed(false)
    setStack([HOME])
    setSplash(true)
  }, [])

  const startWalk = useCallback(() => {
    stopWalk()
    setPatientId(TOUR_PATIENT)

    let at = DEMO_MS + TOUR.afterDemoMs

    walk.current = TOUR_STOPS.map(stops => {
      const timer = setTimeout(() => setStack(stops), at)
      at += TOUR.stopMs
      return timer
    })

    walk.current.push(setTimeout(() => setTouring(false), at))
  }, [stopWalk])

  const closeSplash = useCallback(() => {
    setSplash(false)
    if (!demoPending) return
    setDemoPending(false)
    useApp.getState().fireDemo()
    if (touring) startWalk()
  }, [demoPending, touring, startWalk])

  const acceptSeed = useCallback(async (seed: Seed) => {
    await saveSeed(seed)
    const { graph, scenes } = await buildSeedGraph(seed)
    installSeed(graph, scenes)
    leaveOnboarding()
  }, [leaveOnboarding])

  const restartSeed = useCallback(async () => {
    stopWalk()
    setTouring(false)
    setDemoPending(false)
    await forgetSeed()
    setPrefill(DEMO_SEED)
    setNeedsSeed(true)
    setStack([HOME])
  }, [stopWalk])

  const startTour = useCallback(async () => {
    stopWalk()
    await forgetSeed()

    if (!useApp.getState().sessionCode) await sync.open()

    setPrefill(DEMO_SEED)
    setTouring(true)
    setDemoPending(true)
    setNeedsSeed(true)
    setStack([HOME])
  }, [stopWalk, sync])

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

  if (!fontsLoaded || !booted) return <View className="flex-1 bg-ink" />

  if (needsSeed) {
    return (
      <View className="flex-1 bg-ink">
        <StatusBar hidden />
        <View style={{ flex: 1 }}>
          <OnboardingScreen
            prefill={prefill}
            auto={touring}
            onDone={seed => void acceptSeed(seed)}
            onExample={leaveOnboarding}
          />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-ink">
      <StatusBar hidden />

      <View style={{ flex: 1 }}>
        {route === 'moment' && <MomentScreen onBell={() => go('graph')} />}
        {route === 'graph' && <GraphScreen onOpenMemories={openMemories} />}
        {route === 'memories' && <MemoriesScreen onBack={back} />}
        {route === 'progress' && (
          <ProgressScreen onHome={() => go(HOME)} onBell={() => go('graph')} />
        )}
        {route === 'body' && <BodyScreen
            onBell={() => go('graph')}
            onClinical={() => go('clinical')}
            onRestart={() => void restartSeed()}
            onDemo={() => void startTour()}
          />}
        {route === 'clinical' && (
          <ClinicalScreen
            onBack={back}
            onOpen={id => {
              setPatientId(id)
              go('patient')
            }}
          />
        )}
        {route === 'patient' && (
          <PatientScreen
            id={patientId}
            onBack={back}
            onHaptics={() => go('haptics')}
            onGraph={() => go('graph')}
          />
        )}
        {route === 'haptics' && <HapticsScreen id={patientId} onBack={back} />}
      </View>

      <CueBanner />

      {CLINIC_ROUTES.includes(route) ? (
        <ClinicianBar
          active="patients"
          onPatients={() => setStack(current => [...current.slice(0, current.indexOf('clinical') + 1)])}
          onLeave={() => setStack(['moment', 'body'])}
        />
      ) : (
      <BottomBar
        route={route}
        onNavigate={next => {
          if (next === 'memories') setMemoryFilter(null)
          go(next)
        }}
        onHome={() => setStack([HOME])}
      />
      )}

      {splash && <Splash onDone={closeSplash} />}
    </View>
  )
}
