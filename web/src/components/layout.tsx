'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/store'
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
        'relative flex h-full flex-col gap-4 px-7 pb-[104px] pt-[calc(22px+env(safe-area-inset-top,0px))]',
        scroll ? 'overflow-y-auto' : 'overflow-hidden',
        className
      )}
    >
      {children}
    </section>
  )
}

export function ScreenTop({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-4 px-7 pt-[calc(22px+env(safe-area-inset-top,0px))]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Tabs<T extends string>({
  options,
  value,
  onChange
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div role="tablist" className="flex shrink-0 self-start rounded-full bg-surface-2 p-1">
      {options.map(option => {
        const on = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-0 rounded-full px-4 py-2 text-[13px] transition-colors',
              on ? 'bg-surface font-semibold text-fg shadow-soft' : 'font-medium text-dim'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function ScreenHeader({
  label,
  title,
  sub,
  aside
}: {
  label?: string
  title: React.ReactNode
  sub?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <header className="shrink-0">
      {label && <p className="label-caps">{label}</p>}
      <h2 className={cn('voice text-xl leading-tight', label && 'mt-1.5')}>{title}</h2>
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
        'rounded-[24px] bg-surface p-5 shadow-[0_2px_4px_rgba(90,70,160,0.04),0_10px_28px_-8px_rgba(90,70,160,0.14)]',
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
      <p className="flex w-fit max-w-full items-center gap-2 overflow-hidden rounded-2xl bg-surface/80 px-5 py-3 text-[14px] font-medium text-dim shadow-[0_1px_3px_rgba(90,70,160,0.06)] backdrop-blur-md">
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

export function TopBar({
  left,
  right,
  className
}: {
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-11 shrink-0 items-center justify-between', className)}>
      <div className="flex min-w-0 items-center">{left}</div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </div>
  )
}

export function BrandMark() {
  return <img src="/brand/logo.webp" alt="eilo" className="h-6 w-auto" />
}

export function BackButton({ label = 'Voltar' }: { label?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="-ml-2 flex min-h-0 items-center gap-1 py-2 pl-2 pr-3 text-[14px] font-semibold text-dim"
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.5 6.5 10l5.5 5.5" />
      </svg>
      {label}
    </button>
  )
}

export function NotificationBell() {
  const unseen = useApp(s => s.unseenLearning)
  const count = unseen.length

  return (
    <Link
      href="/graph"
      aria-label={
        count > 0
          ? `${count} ${count === 1 ? 'palavra nova' : 'palavras novas'} no mapa`
          : 'Nada novo no mapa'
      }
      className="relative grid size-11 place-items-center rounded-full text-dim transition-colors active:bg-surface-2"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8.6a6 6 0 1 0-12 0c0 4.2-1.4 5.6-2 6.3-.3.4 0 1 .5 1h15c.5 0 .8-.6.5-1-.6-.7-2-2.1-2-6.3Z" />
        <path d="M10.2 19.4a2.1 2.1 0 0 0 3.6 0" />
      </svg>

      {count > 0 && (
        <span className="absolute right-[9px] top-[9px] grid min-w-[17px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-[17px] text-brand-ink ring-2 ring-ink">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
