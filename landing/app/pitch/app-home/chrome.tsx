const STROKE = {
  fill: 'none',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

const WAVE_PATH = 'M3 12h2.2M8 7.5v9M12 4.5v15M16 8.5v7M20.8 12H19'

const LEFT = [
  {
    label: 'Grafo',
    path: 'M9 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM19.8 8.6a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0ZM3 19c0-2.4 1.9-3.8 4.2-3.8S11.4 16.6 11.4 19M13 19c0-2.4 1.9-3.8 4.2-3.8S21.4 16.6 21.4 19'
  },
  { label: 'Memórias', path: 'M7 4.6h10a1.6 1.6 0 0 1 1.6 1.6v13.2L12 16.4l-6.6 3V6.2A1.6 1.6 0 0 1 7 4.6Z' }
]

const RIGHT = [
  { label: 'Progresso', path: 'M5 19V9M10 19V5M15 19v-7M20 19v-4' },
  {
    label: 'Aparelhos',
    path: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'
  }
]

export function BrandMark() {
  return <img className="ah-brand" src="/pitch/app/wordmark-lilas2.png" alt="eilo" width={72} height={23} />
}

export function BackdropToggle() {
  return (
    <div className="ah-toggle">
      <span className="ah-toggle__icon">
        <svg viewBox="0 0 24 24" width={19} height={19}>
          <path d={WAVE_PATH} stroke="#6b5fa8" {...STROKE} />
        </svg>
      </span>
      <span className="ah-toggle__label">Onda</span>
    </div>
  )
}

export function NotificationBell() {
  return (
    <div className="ah-bell">
      <svg viewBox="0 0 24 24" width={21} height={21}>
        <path
          d="M18 8.6a6 6 0 1 0-12 0c0 4.2-1.4 5.6-2 6.3-.3.4 0 1 .5 1h15c.5 0 .8-.6.5-1-.6-.7-2-2.1-2-6.3Z"
          stroke="#57546a"
          {...STROKE}
          strokeWidth={1.8}
        />
        <path d="M10.2 19.4a2.1 2.1 0 0 0 3.6 0" stroke="#57546a" {...STROKE} strokeWidth={1.8} />
      </svg>
    </div>
  )
}

function Tab({ label, path }: { label: string; path: string }) {
  return (
    <div className="ah-bar__slot">
      <span className="ah-bar__tab" aria-label={label}>
        <svg viewBox="0 0 24 24" width={21} height={21}>
          <path d={path} stroke="#57546a" {...STROKE} />
        </svg>
      </span>
    </div>
  )
}

export function BottomBar() {
  return (
    <div className="ah-bar">
      <div className="ah-bar__pill">
        {LEFT.map(tab => <Tab key={tab.label} {...tab} />)}
        <div className="ah-bar__slot">
          <span className="ah-orb" aria-label="Ir para o Momento">
            <span className="ah-orb__clip">
              <span className="ah-orb__base" />
              <span className="ah-orb__glow" />
              <span className="ah-orb__shine" />
              <span className="ah-orb__eyes">
                <i />
                <i />
              </span>
            </span>
          </span>
        </div>
        {RIGHT.map(tab => <Tab key={tab.label} {...tab} />)}
      </div>
    </div>
  )
}
