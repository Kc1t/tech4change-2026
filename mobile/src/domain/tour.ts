import { DEMO_SCRIPT } from './demoFlow'
import type { Route } from '../navigation'

export const TOUR = {
  welcomeMs: 2200,
  readMs: 620,
  typeMs: 45,
  holdMs: 700,
  stopMs: 3400,
  afterDemoMs: 2000
} as const

export const DEMO_MS = DEMO_SCRIPT.reduce((longest, beat) => Math.max(longest, beat.at), 0)

export const TOUR_PATIENT = 'anibal'

export const TOUR_STOPS: Route[][] = [
  ['moment', 'graph'],
  ['moment', 'memories'],
  ['moment', 'progress'],
  ['moment', 'body'],
  ['moment', 'body', 'clinical'],
  ['moment', 'body', 'clinical', 'patient'],
  ['moment', 'body', 'clinical', 'patient', 'haptics'],
  ['moment']
]
