import { SLIDE_ASSETS } from './assets'
import { motionDelay } from './motion'

export function SlideFooter({ index, total, note }: { index: number; total: number; note?: string }) {
  return (
    <div className="abs slide-footer rise" style={motionDelay(1000)}>
      <img src={`${SLIDE_ASSETS}/eilo-logo-icone.webp`} alt="eilo" />
      {note && <span>{note}</span>}
      <i />
      <span>{index + 1} / {total}</span>
    </div>
  )
}
