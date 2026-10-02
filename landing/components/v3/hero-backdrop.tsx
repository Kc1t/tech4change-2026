'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './use-reduced-motion'

export function HeroBackdrop() {
  const still = usePrefersReducedMotion()
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!video.current) return
    if (still) video.current.pause()
    else void video.current.play().catch(() => {})
  }, [still])

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#efeaf8]">
      <video
        ref={video}
        className="absolute inset-x-0 bottom-0 h-[46%] w-full object-cover object-[69%_100%] [mask-image:linear-gradient(to_bottom,transparent,black_40%)] sm:top-0 sm:h-full sm:translate-y-[26%] sm:object-[50%_100%] sm:[mask-image:linear-gradient(to_bottom,transparent,black_30%)]"
        src="/hero/conversa.mp4"
        poster="/hero/conversa.webp"
        preload="auto"
        muted
        loop
        playsInline
      />
      <div className="v3-veil-top absolute inset-0" />
    </div>
  )
}
