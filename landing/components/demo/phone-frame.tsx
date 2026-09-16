import type { ReactNode } from 'react'

export function PhoneFrame({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[272px] ${className}`}>
      <div className="rounded-[2.4rem] border border-[var(--frame-line)] bg-[var(--frame)] p-2 shadow-[0_44px_90px_-44px_rgba(20,14,12,0.75)]">
        <div className="relative aspect-[9/16.6] overflow-hidden rounded-[2rem] bg-[var(--stage)]">
          <span
            aria-hidden="true"
            className="absolute top-2.5 left-1/2 z-20 h-1 w-14 -translate-x-1/2 rounded-full bg-white/20"
          />
          {children}
        </div>
      </div>
    </div>
  )
}
