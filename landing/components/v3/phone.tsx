import type { ReactNode } from 'react'

export function PhoneShell({
  children,
  className = '',
  cropped = false
}: {
  children: ReactNode
  className?: string
  cropped?: boolean
}) {
  return (
    <div
      className={`v3-phone-shell relative overflow-hidden text-left text-[var(--v3-ink)] ${
        cropped ? 'rounded-t-[2.4rem]' : 'rounded-[2.4rem] !border-b-6'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-3 left-1/2 z-10 h-[20px] w-[86px] -translate-x-1/2 rounded-full bg-[#0e0e10]"
      />
      <div className="absolute top-[13px] left-6 z-10 text-[0.65rem] font-semibold">9:41</div>
      <div
        aria-hidden="true"
        className="absolute top-[15px] right-6 z-10 flex items-center gap-[3px]"
      >
        <i className="block h-[6px] w-[3px] rounded-[1px] bg-current" />
        <i className="block h-[8px] w-[3px] rounded-[1px] bg-current" />
        <i className="ml-[3px] block h-[8px] w-[14px] rounded-[2px] border border-current" />
      </div>
      {children}
    </div>
  )
}

export function ScreenListening() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#f7f6fb] to-[#ecebf4] px-6 pt-12 pb-7">
      <p className="text-center text-[0.75rem] text-[var(--v3-muted)]">‹ conversa de almoço</p>
      <div className="v3-orb mx-auto mt-10 size-[128px] rounded-full" />
      <p className="mt-8 text-center text-[1.3rem] leading-[1.2] font-medium tracking-[-0.03em] text-[#58566a]">
        Estou ouvindo
        <br />o que falta.
      </p>
      <div className="mt-auto flex items-center justify-center gap-4 pt-8">
        <span className="size-10 rounded-full bg-white/70" />
        <span className="size-14 rounded-full bg-[linear-gradient(180deg,#8e7ff0,#6b5fa8)] shadow-[0_10px_24px_-8px_rgba(107,95,168,0.9)]" />
        <span className="size-10 rounded-full bg-white/70" />
      </div>
    </div>
  )
}

export function ScreenGreeting() {
  return (
    <div className="flex h-full flex-col bg-white px-6 pt-12 pb-6">
      <p className="text-[0.75rem] text-[var(--v3-muted)]">☰ terça-feira</p>
      <p className="mt-6 text-[1.55rem] leading-[1.14] font-semibold tracking-[-0.035em]">
        Bom dia, Antônio.
        <br />
        Vamos juntos?
      </p>
      <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--v3-muted)]">
        Ontem você alcançou 9 das 11 palavras que travaram. Sete delas no primeiro degrau.
      </p>
      <div className="mt-6 space-y-2.5">
        {[
          ['almoço com a Letícia', '2 degraus'],
          ['ligação para o Renato', '1 degrau'],
          ['consulta de quarta', 'sem travas']
        ].map(([label, meta]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-[var(--v3-line)] px-4 py-3"
          >
            <span className="text-[0.75rem]">{label}</span>
            <span className="text-[0.68rem] text-[var(--v3-muted)]">{meta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RUNGS = [
  { label: 'Alguém da sua família', hint: 'degrau 1' },
  { label: 'Alguém mais novo que você', hint: 'degrau 2' },
  { label: 'Começa com LE', hint: 'degrau 3' }
]

export function ScreenLadder() {
  return (
    <div className="flex h-full flex-col bg-white px-6 pt-12 pb-6">
      <p className="text-[0.75rem] text-[var(--v3-muted)]">‹ a palavra travou</p>
      <div className="mt-5 space-y-2.5">
        {RUNGS.map(rung => (
          <div key={rung.hint} className="rounded-2xl bg-[#f4f2fb] px-4 py-3">
            <p className="text-[0.62rem] tracking-[0.14em] text-[var(--v3-accent)] uppercase">
              {rung.hint}
            </p>
            <p className="mt-1 text-[0.82rem] leading-snug">{rung.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-[linear-gradient(160deg,#6b5fa8,#443c63)] px-4 py-4 text-white">
        <p className="text-[0.62rem] tracking-[0.14em] text-white/60 uppercase">degrau 4</p>
        <p className="mt-1.5 text-[1.2rem] leading-none font-semibold tracking-[-0.03em]">Letícia</p>
      </div>
      <p className="mt-5 text-[0.7rem] text-[var(--v3-muted)]">a conversa continua</p>
      <div aria-hidden="true" className="mt-2 flex h-7 items-end gap-[3px] opacity-70">
        {[6, 12, 9, 20, 14, 26, 18, 28, 16, 22, 11, 17, 8, 13, 6].map((h, i) => (
          <i
            key={i}
            className="w-[3px] rounded-full bg-[#1c1b22]"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <p className="tabular mt-auto pt-6 text-[0.7rem] text-[var(--v3-muted)]">
        3,8 s entre a pausa e a palavra
      </p>
    </div>
  )
}
