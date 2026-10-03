import './global.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler, LogBox, View } from 'react-native'
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
import { useSyncChannel, useSyncPolling } from './src/hooks/useSyncChannel'
import { CLINIC_ROUTES, HOME, type Route } from './src/navigation'
import { installExample, installSeed, useApp } from './src/store'
import { DEMO_SEED, buildSeedGraph, type Seed } from './src/domain/seed'
import { forgetSeed, readSeed, saveSeed } from './src/domain/seedStore'
import { readComfort } from './src/domain/comfort'
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
  useSyncPolling()

  const stopWalk = useCallback(() => {
    walk.current.forEach(clearTimeout)
    walk.current = []
  }, [])

  const cancelTour = useCallback(() => {
    stopWalk()
    setTouring(false)
  }, [stopWalk])

  useEffect(() => stopWalk, [stopWalk])

  useEffect(() => {
    let alive = true

    void readComfort().then(comfort => {
      if (alive) useApp.getState().applyComfort(comfort)
    })

    void readSeed()
      .then(async seed => {
        if (!alive) return
        if (seed) {
          const { graph, scenes } = await buildSeedGraph(seed)
          if (!alive) return
          installSeed(graph, scenes)
          setSplash(true)
        } else {
          setNeedsSeed(true)
        }
      })
      .catch(() => {
        if (!alive) return
        installExample()
        setSplash(true)
      })
      .finally(() => {
        if (alive) setBooted(true)
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

  const showExample = useCallback(() => {
    installExample()
    leaveOnboarding()
  }, [leaveOnboarding])

  const acceptSeed = useCallback(async (seed: Seed) => {
    const built = await buildSeedGraph(seed).catch(() => null)
    if (built) {
      await saveSeed(seed)
      installSeed(built.graph, built.scenes)
    } else {
      installExample()
    }
    leaveOnboarding()
  }, [leaveOnboarding])

  const restartSeed = useCallback(async () => {
    cancelTour()
    setDemoPending(false)
    await forgetSeed()
    setNeedsSeed(true)
    setStack([HOME])
  }, [cancelTour])

  const startTour = useCallback(async () => {
    stopWalk()
    await forgetSeed()

    if (!useApp.getState().sessionCode) void sync.open()

    useApp.getState().setHelpLevel('hint')
    useApp.getState().clearDemo()
    setPrefill(DEMO_SEED)
    setTouring(true)
    setDemoPending(true)
    setNeedsSeed(true)
    setStack([HOME])
  }, [stopWalk, sync])

  const setMemoryFilter = useApp(s => s.setMemoryFilter)
  const route = stack[stack.length - 1]!

  const go = useCallback((next: Route) => {
    cancelTour()
    setStack(current => (current[current.length - 1] === next ? current : [...current, next]))
  }, [cancelTour])

  const back = useCallback(() => {
    cancelTour()
    setStack(current => (current.length > 1 ? current.slice(0, -1) : current))
  }, [cancelTour])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length <= 1) return false
      back()
      return true
    })
    return () => subscription.remove()
  }, [stack.length, back])

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
            onExample={showExample}
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
        {route === 'body' && (
          <BodyScreen
            onBell={() => go('graph')}
            onClinical={() => go('clinical')}
            onRestart={() => void restartSeed()}
            onDemo={() => void startTour()}
          />
        )}
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
          onPatients={() => {
            cancelTour()
            setStack(current => [...current.slice(0, current.indexOf('clinical') + 1)])
          }}
          onLeave={() => {
            cancelTour()
            setStack(['moment', 'body'])
          }}
        />
      ) : (
        <BottomBar
          route={route}
          onNavigate={next => {
            if (next === 'memories') setMemoryFilter(null)
            go(next)
          }}
          onHome={() => {
            cancelTour()
            setStack([HOME])
          }}
        />
      )}

      {splash && <Splash onDone={closeSplash} />}
    </View>
  )
}
