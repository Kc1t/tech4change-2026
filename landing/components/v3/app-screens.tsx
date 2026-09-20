import type { ReactNode } from 'react'
import { Orb } from './orb'

const INK = '#f6f5fb'
const FG = '#1b1a22'
const DIM = '#57546a'
const FAINT = '#6a6779'
const LINE = '#e6e3ef'
const SURFACE_2 = '#e8e4f4'
const BRAND = '#6b5fa8'

const CARD_SHADOW = '0 6px 18px rgba(90,70,160,0.1)'
const BAR_SHADOW = '0 10px 24px rgba(90,70,160,0.14)'

const TAB_ICONS = {
  graph:
    'M9 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM19.8 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM3 19c0-2.4 1.9-3.8 4.2-3.8S11.4 16.6 11.4 19M13 19c0-2.4 1.9-3.8 4.2-3.8S21.4 16.6 21.4 19',
  memories: 'M7 4.6h10a1.6 1.6 0 0 1 1.6 1.6v13.2L12 16.4l-6.6 3V6.2A1.6 1.6 0 0 1 7 4.6Z',
  progress: 'M5 19V9M10 19V5M15 19v-7M20 19v-4',
  body: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'
} as const

type Tab = keyof typeof TAB_ICONS

function StatusBar() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[54px]">
      <span className="absolute top-[11px] left-1/2 h-[30px] w-[124px] -translate-x-1/2 rounded-full bg-[#0e0e10]" />
      <span className="absolute top-[17px] left-[26px] text-[14px] leading-none font-semibold">
        9:41
      </span>
      <span className="absolute top-[18px] right-[26px] flex items-center gap-[4px]">
        <i className="block h-[9px] w-[4px] rounded-[1px] bg-current" />
        <i className="block h-[12px] w-[4px] rounded-[1px] bg-current" />
        <i className="ml-[4px] block h-[12px] w-[21px] rounded-[3px] border border-current" />
      </span>
    </div>
  )
}

export function Device({ children, width }: { children: ReactNode; width: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="v3-screen-inner"
        style={{ '--s': width / 390, background: INK, color: FG } as React.CSSProperties}
      >
        <StatusBar />
        {children}
      </div>
    </div>
  )
}

function Wordmark() {
  return <img src="/brand/logo.webp" alt="" aria-hidden="true" className="h-[23px] w-auto" />
}

function Bell() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
      <path
        d="M12 3.6a5.4 5.4 0 0 0-5.4 5.4v3.4l-1.4 2.6h13.6L17.4 12.4V9A5.4 5.4 0 0 0 12 3.6ZM10 18.4a2 2 0 0 0 4 0"
        fill="none"
        stroke={DIM}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TopBar({ right }: { right?: ReactNode }) {
  return (
    <div className="flex h-11 items-center justify-between">
      <Wordmark />
      <div className="flex items-center gap-3">{right}</div>
    </div>
  )
}

function Caps({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[11px] leading-[14px] font-semibold tracking-[1.4px] ${className}`}
      style={{ color: FAINT }}
    >
      {children}
    </p>
  )
}

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <p className="text-[26px] leading-[30px] font-medium tracking-[-0.9px]">{title}</p>
      {sub ? (
        <p className="mt-2 text-[15px] leading-[22px] font-medium" style={{ color: DIM }}>
          {sub}
        </p>
      ) : null}
    </div>
  )
}

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <span className="flex flex-1 items-center justify-center">
      <span
        className="grid size-11 place-items-center rounded-full"
        style={active ? { background: SURFACE_2 } : undefined}
      >
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
          <path
            d={TAB_ICONS[tab]}
            fill="none"
            stroke={active ? FG : DIM}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  )
}

function BottomBar({ tab }: { tab?: Tab }) {
  return (
    <div className="absolute inset-x-0 bottom-0 px-6 pb-[22px]">
      <div
        className="flex items-center rounded-full bg-white px-2 py-2"
        style={{ boxShadow: BAR_SHADOW }}
      >
        <TabIcon tab="graph" active={tab === 'graph'} />
        <TabIcon tab="memories" active={tab === 'memories'} />

        <span className="flex flex-1 items-center justify-center">
          <span
            className="block size-[52px] rounded-full"
            style={{ background: 'linear-gradient(160deg,#b9a3f7,#6b5fa8)' }}
          />
        </span>

        <TabIcon tab="progress" active={tab === 'progress'} />
        <TabIcon tab="body" active={tab === 'body'} />
      </div>
    </div>
  )
}

const MOMENT = {
  waiting: {
    status: 'ESCUTA DESLIGADA',
    kind: 'ESPERANDO A PALAVRA',
    text: 'É a… a…',
    caption: 'Toque quando a palavra não vier.',
    dots: 0
  },
  cue: {
    status: 'DEGRAU 3 DE 4',
    kind: 'O DEGRAU',
    text: 'Mora em Sorocaba',
    caption: 'degrau 3 · lugar',
    dots: 3
  },
  word: {
    status: 'DESTRAVOU',
    kind: 'A PALAVRA',
    text: 'Letícia',
    caption: 'Em 3 degraus. Da próxima vez a dica começa mais longe.',
    dots: 4
  }
} as const

export function ScreenMoment({
  state = 'waiting',
  orb = 200,
  footer = 132,
  bar = true
}: {
  state?: keyof typeof MOMENT
  orb?: number
  footer?: number
  bar?: boolean
}) {
  const view = MOMENT[state]

  return (
    <div className="flex h-full flex-col pt-[54px]">
      <div className="flex flex-col gap-3 px-6">
        <TopBar right={<Bell />} />
        <div>
          <Caps>{view.status}</Caps>
          <p className="mt-2 max-w-[300px] text-[19px] leading-[26px]" style={{ color: DIM }}>
            Quem que vem no domingo?
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <Orb rings={false} style={{ width: orb }} />

        <Caps className="mt-9">{view.kind}</Caps>

        <p
          className="mt-4 max-w-[300px] text-center text-[42px] leading-[46px] font-medium tracking-[-1.5px]"
          style={{ color: state === 'word' ? BRAND : state === 'cue' ? FG : FAINT }}
        >
          {view.text}
        </p>

        <p
          className="mt-4 max-w-[300px] text-center text-[14px] leading-[20px]"
          style={{ color: DIM }}
        >
          {view.caption}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3" style={{ paddingBottom: footer }}>
        {state !== 'waiting' ? (
          <p className="text-[14px] font-semibold" style={{ color: DIM }}>
            {state === 'word' ? 'Ver outra palavra' : 'Consegui'}
          </p>
        ) : null}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(level => (
            <i
              key={level}
              className="block size-1.5 rounded-full"
              style={{ background: level <= view.dots ? BRAND : LINE }}
            />
          ))}
        </div>
      </div>

      {bar ? <BottomBar /> : null}
    </div>
  )
}

const CLOUD = [
  { label: 'Letícia', size: 27, left: 62, top: 13, tint: '#e2d6f3', ink: '#4a3566' },
  { label: 'Renato', size: 20, left: 24, top: 27, tint: '#e2d6f3', ink: '#4a3566' },
  { label: 'Biju', size: 15, left: 79, top: 36, tint: '#d5e2f2', ink: '#2f4665' },
  { label: 'Helena', size: 34, left: 44, top: 51, tint: '#e2d6f3', ink: '#4a3566' },
  { label: 'a praça', size: 15, left: 75, top: 65, tint: '#d3e8d8', ink: '#2d5340' },
  { label: 'Sorocaba', size: 22, left: 28, top: 73, tint: '#d3e8d8', ink: '#2d5340' },
  { label: 'bengala', size: 17, left: 63, top: 88, tint: '#f7e0c6', ink: '#6b4522' }
]

export function ScreenMap({ bar = true }: { bar?: boolean }) {
  return (
    <div className="flex h-full flex-col pt-[54px]">
      <div className="flex flex-col gap-3 px-6">
        <TopBar
          right={
            <span
              className="flex rounded-full p-[3px] text-[11px] font-semibold"
              style={{ background: SURFACE_2 }}
            >
              <span className="rounded-full bg-white px-3 py-1.5">Vida</span>
              <span className="px-3 py-1.5" style={{ color: DIM }}>
                Aprendizado
              </span>
            </span>
          }
        />
        <Header title="Mapa" sub="Toque numa palavra para ver de onde ela veio." />
      </div>

      <div className="relative mx-4 mt-4 min-h-[240px] flex-1">
        {CLOUD.map(word => (
          <span
            key={word.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 font-medium whitespace-nowrap"
            style={{
              left: `${word.left}%`,
              top: `${word.top}%`,
              fontSize: `${word.size}px`,
              lineHeight: 1.25,
              background: word.tint,
              color: word.ink
            }}
          >
            {word.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-6" style={{ paddingBottom: bar ? 128 : 24 }}>
        <div
          className="flex items-center gap-3 rounded-[14px] bg-white p-3"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <span
            className="grid size-[38px] shrink-0 place-items-center rounded-[11px]"
            style={{ background: '#e2d6f3' }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path
                d="M12 4.5v9M8.5 7.5v3M15.5 7.5v3M5 9v0M19 9v0M5 18.5h14"
                fill="none"
                stroke="#4a3566"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <Caps>ÁUDIO · LETÍCIA</Caps>
            <span className="mt-1 block truncate text-[13px] leading-[19px] font-medium">
              “A vó vai adorar ver você domingo”
            </span>
          </span>
          <span
            className="rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ background: SURFACE_2, color: DIM }}
          >
            +4
          </span>
        </div>

        <p className="py-2 text-center text-[12.5px] font-semibold" style={{ color: DIM }}>
          Ver todas as 14 memórias
        </p>
      </div>

      {bar ? <BottomBar tab="graph" /> : null}
    </div>
  )
}

const TREND = 'M-12,112 C60,104 96,96 150,84 C204,72 250,58 300,46 C340,36 372,30 402,26'

const MARKS = ['22 DE JUL', '05 DE AGO', '19 DE AGO', '02 DE SET', '16 DE SET']

const WORDS = [
  { label: 'Letícia', tint: '#2f7a5c' },
  { label: 'Sorocaba', tint: '#2f7a5c' },
  { label: 'Renato', tint: '#a06210' },
  { label: 'bengala', tint: '#a06210' },
  { label: 'Biju', tint: '#b03a4e' },
  { label: 'a praça', tint: LINE }
]

const GAUGE = [
  { from: '#8e7ff0', to: '#b9a3f7', grow: 1 },
  { from: '#b9a3f7', to: '#ffe0f2', grow: 1.2 },
  { from: '#2f7a5c', to: '#ffe0f2', grow: 0.8 },
  { from: '#b9a3f7', to: '#8e7ff0', grow: 1.1 }
]

function StatCard({
  label,
  value,
  unit,
  delta,
  tint
}: {
  label: string
  value: string
  unit: string
  delta: string
  tint: string
}) {
  return (
    <div className="flex-1 rounded-[24px] bg-white p-5" style={{ boxShadow: CARD_SHADOW }}>
      <p className="mb-1 text-[14px] font-medium" style={{ color: FAINT }}>
        {label}
      </p>
      <p className="flex items-baseline">
        <span className="text-[24px] leading-none font-bold tracking-[-0.7px]">{value}</span>
        <span className="ml-1 text-[18px] font-semibold" style={{ color: FAINT }}>
          {unit}
        </span>
      </p>
      <p className="mt-2 text-[12px] font-semibold" style={{ color: tint }}>
        {delta}
      </p>
    </div>
  )
}

export function ScreenProgress({ bar = true }: { bar?: boolean }) {
  return (
    <div className="flex h-full flex-col pt-[54px]">
      <div className="flex flex-col gap-3 px-6">
        <TopBar right={<Bell />} />
        <Header title="Progresso" sub="Quanto ela já alcança sozinha." />
      </div>

      <div className="mt-3">
        <svg viewBox="0 0 390 150" width="390" height="150" aria-hidden="true">
          <defs>
            <linearGradient id="v3-trend" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#b9a3f7" />
              <stop offset="0.35" stopColor="#ffe0f2" />
              <stop offset="0.55" stopColor="#2f7a5c" />
              <stop offset="0.75" stopColor="#b9a3f7" />
              <stop offset="1" stopColor="#8e7ff0" />
            </linearGradient>
          </defs>
          <path
            d="M-20,115 Q 30,95 80,105 T 180,100 T 260,110 T 340,90 T 410,115 L410,150 L-20,150 Z"
            fill="#dcd4f2"
            opacity="0.3"
          />
          <path
            d={TREND}
            fill="none"
            stroke="url(#v3-trend)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="300" cy="46" r="6.5" fill="#fff" stroke="#ffe0f2" strokeWidth="2.5" />
          <circle cx="300" cy="46" r="3.5" fill="#2f7a5c" />
        </svg>
        <div className="mt-1.5 flex justify-between px-6">
          {MARKS.map(mark => (
            <span
              key={mark}
              className="text-[11px] font-semibold tracking-[0.8px]"
              style={{ color: FAINT }}
            >
              {mark}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center px-6">
        <span
          className="flex items-center gap-2 rounded-[18px] bg-white px-[18px] py-3 text-[14px] font-medium"
          style={{ boxShadow: CARD_SHADOW, color: DIM }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 3v18m9-9H3"
              fill="none"
              stroke="#2f7a5c"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M18.364 5.636 5.636 18.364m12.728 0L5.636 5.636"
              fill="none"
              stroke="#2f7a5c"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          Menos ajuda nas últimas 5 vezes
        </span>
      </div>

      <div className="mt-5 flex gap-4 px-6">
        <StatCard
          label="Degrau médio"
          value="1,6"
          unit="de 4"
          delta="−1,2 que antes"
          tint="#5145cd"
        />
        <StatCard label="Sozinha" value="4" unit="de 6" delta="37 tentativas" tint="#b07708" />
      </div>

      <div className="mt-5 px-6">
        <p className="text-[32px] leading-none font-bold tracking-[-1.3px]">71</p>
        <p className="mt-0.5 mb-4 text-[13px] font-semibold" style={{ color: FAINT }}>
          Autonomia
        </p>
        <div className="flex h-6 gap-1.5">
          {GAUGE.map(segment => (
            <span
              key={segment.from + segment.to}
              className="h-6 rounded-full"
              style={{
                flexGrow: segment.grow,
                background: `linear-gradient(90deg, ${segment.from}, ${segment.to})`,
                opacity: 0.9
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 px-6">
        {WORDS.map(word => (
          <span
            key={word.label}
            className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[13.5px] font-medium"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <i className="block size-2 rounded-full" style={{ background: word.tint }} />
            {word.label}
          </span>
        ))}
      </div>

      {bar ? <BottomBar tab="progress" /> : null}
    </div>
  )
}
