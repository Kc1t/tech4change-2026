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
      {children}
    </div>
  )
}
