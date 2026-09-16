import { cn } from '@/lib/utils'

export function Screen({
  children,
  scroll = true,
  className
}: {
  children: React.ReactNode
  scroll?: boolean
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative flex h-full flex-col px-7 pb-[104px] pt-[calc(22px+env(safe-area-inset-top,0px))]',
        scroll ? 'overflow-y-auto' : 'overflow-hidden',
        className
      )}
    >
      {children}
    </section>
  )
}

export function ScreenHeader({
  label,
  title,
  sub,
  aside
}: {
  label: string
  title: React.ReactNode
  sub?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <header className="shrink-0">
      <p className="label-caps">{label}</p>
      <h2 className="voice mt-1.5 text-xl leading-tight">{title}</h2>
      {sub && <p className="mt-2 text-[15px] font-medium leading-relaxed text-dim">{sub}</p>}
      {aside && <div className="mt-3">{aside}</div>}
    </header>
  )
}

export function Section({
  title,
  children,
  className
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mt-8', className)}>
      {title && <h3 className="mb-3 text-[17px] font-bold tracking-[-0.02em] text-fg">{title}</h3>}
      {children}
    </div>
  )
}

export function Card({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] bg-surface p-5 shadow-[0_2px_4px_rgba(22,22,22,0.04),0_10px_28px_-8px_rgba(22,22,22,0.14)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <p className="flex w-fit max-w-full items-center gap-2 overflow-hidden rounded-2xl bg-surface/80 px-5 py-3 text-[14px] font-medium text-dim shadow-[0_1px_3px_rgba(22,22,22,0.06)] backdrop-blur-md">
        <Sparkle />
        <span className="truncate">{children}</span>
      </p>
    </div>
  )
}

export function Sparkle({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-px size-5 shrink-0"
      fill="none"
      stroke={muted ? 'var(--line)' : 'var(--mastery-high)'}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 3v18m9-9H3" />
      <path d="M18.364 5.636 5.636 18.364m12.728 0L5.636 5.636" opacity="0.5" />
    </svg>
  )
}
