export const color = {
  stage: '#000000',

  ink: '#f2f2f0',
  surface: '#ffffff',
  surface2: '#e8e8e4',
  line: '#d6d6d1',
  lineSoft: '#e4e4df',
  fg: '#161616',
  dim: '#4a4a48',
  faint: '#6f6f6c',
  label: '#6b6b68',

  brand: '#bf3f63',
  brandInk: '#ffffff',
  brandSoft: '#f8e0e6',
  brandWarm: '#f0a36b',
  brandRose: '#d65a7a',

  auroraBase: '#fbd9c4',
  aurora1: '#f39a6b',
  aurora2: '#d8577c',
  aurora3: '#6b3f8f',
  aurora4: '#ffe3a8',

  deltaUp: '#5145cd',
  deltaNote: '#b07708',
  deltaDown: '#b03a4e',

  masteryHigh: '#2f7a5c',
  masteryMedium: '#a06210',
  masteryLow: '#b03a4e'
} as const

export const kindColor = {
  person: '#e2d6f3',
  place: '#d3e8d8',
  object: '#f7e0c6',
  event: '#f9d9cf',
  animal: '#d5e2f2'
} as const

export const kindInk = {
  person: '#4a3566',
  place: '#2d5340',
  object: '#6b4522',
  event: '#71382a',
  animal: '#2f4665'
} as const

export const font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold'
} as const

export const radius = {
  card: 14,
  panel: 18,
  large: 24,
  cloud: 30,
  pill: 999
} as const

export const tap = { min: 48 } as const

export const shadow = {
  card: {
    shadowColor: '#161616',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  bar: {
    shadowColor: '#161616',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  }
} as const
