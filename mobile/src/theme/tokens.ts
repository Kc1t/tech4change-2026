export const color = {
  stage: '#000000',

  ink: '#f6f5fb',
  surface: '#ffffff',
  surface2: '#e8e4f4',
  line: '#e6e3ef',
  lineSoft: '#efedf6',
  fg: '#1b1a22',
  dim: '#57546a',
  faint: '#6a6779',
  label: '#6a6779',

  brand: '#6b5fa8',
  brandInk: '#ffffff',
  brandSoft: '#e4e0fb',
  brandWarm: '#efb6ec',
  brandRose: '#8e7ff0',

  auroraBase: '#e7dffb',
  aurora1: '#b9a3f7',
  aurora2: '#efb6ec',
  aurora3: '#a9dcff',
  aurora4: '#ffe0f2',

  deltaUp: '#5145cd',
  deltaNote: '#b07708',
  deltaDown: '#b03a4e',

  warnSoft: '#fcefd9',
  warnInk: '#7a4800',
  goodSoft: '#e3f4ea',
  goodInk: '#1a6b43',

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

export const shadow = {
  card: {
    shadowColor: '#5a46a0',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  bar: {
    shadowColor: '#5a46a0',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  }
} as const
