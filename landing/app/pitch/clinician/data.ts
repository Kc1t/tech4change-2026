export type Kind = 'person' | 'place' | 'object' | 'animal'
export type Period = 'week' | 'month' | 'all'
export type State = 'unaided' | 'one_rung' | 'full_ladder'
export type Channel = 'phone' | 'watch' | 'earbuds'
export type FeedDay = 'now' | 'today' | 'yesterday' | 'saturday'
export type LadderOrigin = 'ai' | 'rule'

export interface Word {
  id: string
  label: string
  kind: Kind
  alias?: string
  photo?: string
  rungs: [string, string, string, string]
  attempts: number[]
  levels: number[]
  gaveUp: number[]
  tip: string
}

export interface FeedEvent {
  key: string
  day: FeedDay
  time: string
  kind: 'block' | 'step' | 'resolved' | 'abandoned' | 'given'
  word: string
  level: number
  seconds?: number
  channel?: Channel
  origin?: LadderOrigin
  live?: boolean
}

export const WEEKS = 8
export const ESO_MINUTES = 180

export const PERIODS: Period[] = ['week', 'month', 'all']

export const PERIOD_LABEL: Record<Period, string> = {
  week: 'Esta semana',
  month: '4 semanas',
  all: 'Tudo'
}

export const PERIOD_FROM: Record<Period, number> = { week: 7, month: 4, all: 0 }

export const PERIOD_SPAN: Record<Period, string> = { week: 'nesta semana', month: 'nas últimas 4 semanas', all: 'em 8 semanas' }

export const KIND_LABEL: Record<Kind, string> = {
  person: 'pessoa',
  place: 'lugar',
  object: 'objeto',
  animal: 'animal'
}

export const STATE_LABEL: Record<State, string> = {
  unaided: 'sai sozinha',
  one_rung: 'com uma pista',
  full_ladder: 'escada inteira'
}

export const LEVEL_NAME = ['sozinha', 'categoria', 'relação', 'lugar', 'som']

export const CHANNEL_LABEL: Record<Channel, string> = { phone: 'celular', watch: 'relógio', earbuds: 'fone' }

export const DAY_ORDER: FeedDay[] = ['now', 'today', 'yesterday', 'saturday']

export const DAY_LABEL: Record<FeedDay, string> = { now: 'agora', today: 'hoje', yesterday: 'ontem', saturday: 'sáb' }

export const ORIGIN_LABEL: Record<LadderOrigin, string> = { ai: 'IA', rule: 'regra fixa' }

export const PATIENT = { name: 'Helena', photo: '/fono/helena.webp', events: 412 }

export const LIFE_MAP = ['n_fd8f8a', 'n_1fd17c', 'n_07b20f', 'n_18a1dd', 'n_52a9aa']

export const WORDS: Word[] = [
  {
    id: 'n_fd8f8a',
    label: 'Letícia',
    kind: 'person',
    alias: 'Lelê',
    photo: '/fono/leticia.webp',
    rungs: ['é da família', 'da geração dos netos', 'mora em Sorocaba', 'Le…'],
    attempts: [3, 3, 4, 4, 4, 5, 4, 5],
    levels: [3, 3, 3, 2, 2, 1, 1, 0],
    gaveUp: [0, 0, 0, 0, 0, 0, 0, 0],
    tip: 'Saiu sozinha nas 5 vezes desta semana. Dá para espaçar o treino da neta.'
  },
  {
    id: 'n_1fd17c',
    label: 'Marina',
    kind: 'person',
    rungs: ['é da família', 'da geração dos filhos', 'mora em Sorocaba', 'Ma…'],
    attempts: [2, 2, 2, 3, 2, 3, 3, 3],
    levels: [3, 3, 3, 2, 2, 2, 2, 1],
    gaveUp: [0, 0, 0, 0, 0, 0, 0, 0],
    tip: 'Já sai com a primeira pista. Na sessão, tentar sem pista, com a foto da filha.'
  },
  {
    id: 'n_18a1dd',
    label: 'Tupi',
    kind: 'animal',
    rungs: ['é o cachorro', 'o preto', 'que dorme na varanda', 'Tu…'],
    attempts: [1, 2, 1, 2, 2, 2, 3, 3],
    levels: [3, 2, 2, 2, 1, 1, 1, 0],
    gaveUp: [0, 0, 0, 0, 0, 0, 0, 0],
    tip: 'Saiu sozinha nesta semana. Manter só no dia a dia.'
  },
  {
    id: 'n_07b20f',
    label: 'Sorocaba',
    kind: 'place',
    photo: '/fono/sorocaba.webp',
    rungs: ['é um lugar', 'onde a Letícia mora', 'onde a Marina mora', 'So…'],
    attempts: [2, 2, 2, 2, 3, 2, 3, 3],
    levels: [4, 4, 3, 3, 3, 3, 2, 2],
    gaveUp: [0, 0, 0, 0, 0, 0, 0, 0],
    tip: 'Destrava na pista da neta. Pode valer começar a escada por ela.'
  },
  {
    id: 'n_f299bf',
    label: 'Rodrigo',
    kind: 'person',
    rungs: ['é da família', 'da geração dos filhos', 'mora em Campinas', 'Ro…'],
    attempts: [1, 1, 2, 1, 1, 2, 2, 2],
    levels: [4, 3, 3, 3, 3, 2, 2, 2],
    gaveUp: [0, 0, 0, 0, 0, 0, 0, 0],
    tip: 'Aparece pouco: o filho mora longe. Vale treinar na sessão com a foto dele.'
  },
  {
    id: 'n_52a9aa',
    label: 'escumadeira',
    kind: 'object',
    photo: '/fono/escumadeira.webp',
    rungs: ['é uma coisa da cozinha', 'serve para tirar comida da panela', 'tem furos', 'Es…'],
    attempts: [2, 2, 1, 2, 2, 2, 2, 3],
    levels: [4, 4, 4, 4, 4, 4, 3, 3],
    gaveUp: [0, 0, 1, 0, 0, 0, 0, 0],
    tip: 'Ainda precisa da escada inteira. Trabalhar em sessão pela função: "serve para tirar comida da panela".'
  },
  {
    id: 'n_98b372',
    label: 'Ubatuba',
    kind: 'place',
    rungs: ['é um lugar', 'onde vocês passavam o ano novo', 'fica no litoral norte', 'Uba…'],
    attempts: [1, 1, 1, 1, 1, 1, 1, 2],
    levels: [4, 4, 4, 4, 4, 4, 4, 3],
    gaveUp: [0, 0, 0, 0, 0, 1, 0, 1],
    tip: 'Ficou sem sair 2 vezes no mês. Rever as pistas com a família: talvez o ano novo não seja a melhor lembrança.'
  }
]

export const PRACTICE = {
  minutes: [95, 118, 140, 152, 168, 181, 196, 214],
  days: [3, 4, 4, 5, 5, 5, 6, 6],
  thisWeek: [
    { label: 'seg', minutes: 34 },
    { label: 'ter', minutes: 41 },
    { label: 'qua', minutes: 0 },
    { label: 'qui', minutes: 37 },
    { label: 'sex', minutes: 33 },
    { label: 'sáb', minutes: 38 },
    { label: 'dom', minutes: 31 }
  ]
}

export const FEED: FeedEvent[] = [
  { key: 'f1', day: 'today', time: '10:42', kind: 'resolved', word: 'Letícia', level: 0, seconds: 1.9, channel: 'watch' },
  { key: 'f2', day: 'today', time: '10:42', kind: 'block', word: 'Letícia', level: 0, channel: 'watch' },
  { key: 'f3', day: 'today', time: '09:15', kind: 'resolved', word: 'Tupi', level: 0, seconds: 2.1, channel: 'phone' },
  { key: 'f4', day: 'today', time: '09:15', kind: 'block', word: 'Tupi', level: 0, channel: 'phone' },
  { key: 'f5', day: 'yesterday', time: '19:32', kind: 'resolved', word: 'Sorocaba', level: 2, seconds: 4.8, channel: 'earbuds' },
  { key: 'f6', day: 'yesterday', time: '19:31', kind: 'step', word: 'Sorocaba', level: 2, origin: 'ai' },
  { key: 'f7', day: 'yesterday', time: '19:31', kind: 'step', word: 'Sorocaba', level: 1, origin: 'ai' },
  { key: 'f8', day: 'yesterday', time: '19:31', kind: 'block', word: 'Sorocaba', level: 0, channel: 'earbuds' },
  { key: 'f9', day: 'yesterday', time: '12:08', kind: 'abandoned', word: 'Ubatuba', level: 4, channel: 'phone' },
  { key: 'f10', day: 'yesterday', time: '12:07', kind: 'block', word: 'Ubatuba', level: 0, channel: 'phone' },
  { key: 'f11', day: 'saturday', time: '13:20', kind: 'resolved', word: 'Marina', level: 1, seconds: 3.2, channel: 'watch' },
  { key: 'f12', day: 'saturday', time: '13:19', kind: 'step', word: 'Marina', level: 1, origin: 'rule' },
  { key: 'f13', day: 'saturday', time: '13:19', kind: 'block', word: 'Marina', level: 0, channel: 'watch' },
  { key: 'f14', day: 'saturday', time: '12:51', kind: 'resolved', word: 'escumadeira', level: 3, seconds: 6.6, channel: 'phone' },
  { key: 'f15', day: 'saturday', time: '12:50', kind: 'block', word: 'escumadeira', level: 0, channel: 'phone' }
]

export const SUGGESTIONS = [
  { id: 'work', tone: 'work', text: 'Escumadeira e Ubatuba ainda precisam da escada inteira: vale trabalhar em sessão.' },
  { id: 'attention', tone: 'attention', text: 'Ubatuba ficou sem sair 2 vezes no mês: talvez valha rever as pistas dela com a família.' },
  { id: 'progress', tone: 'progress', text: 'Letícia e Tupi já saíram sozinhas: dá para espaçar o treino delas.' },
  { id: 'practice', tone: 'calm', text: '3 h 34 de prática em 6 dias: acima da meta de 3 h por semana da diretriz europeia.' }
] as const
