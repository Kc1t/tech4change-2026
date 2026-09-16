'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from './use-reduced-motion'

export function Reveal({
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const still = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || still) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [still])

  const shown = still || seen

  return (
    <div
      ref={ref}
      style={still ? undefined : { transitionDelay: `${delay}ms` }}
      className={`v3-ease transition-[opacity,transform] duration-[600ms] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
