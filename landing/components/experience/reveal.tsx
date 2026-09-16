'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -14% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`ease-out-quint transition-[opacity,transform] duration-[900ms] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
