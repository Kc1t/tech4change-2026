import { useEffect, useRef } from 'react'
import { PITCH_ASSETS } from '../deck/assets'
import './promo-video.css'

export function PromoVideo() {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const element = video.current
    if (!element) return
    element.currentTime = 0
    element.play().catch(() => {})
    return () => element.pause()
  }, [])

  return (
    <div className="promo-video"><video ref={video} src={`${PITCH_ASSETS}/eilo-promo-v13-limpo.mp4`} playsInline preload="auto" /></div>
  )
}
