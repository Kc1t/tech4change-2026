import type { CSSProperties } from 'react'
import { PITCH_ASSETS } from './assets'

export function SectionChip({ label }: { label: string }) {
  return (
    <div className="chip" key={label}>
      <div className="buddy"><img src={`${PITCH_ASSETS}/buddy.png`} alt="" /></div>
      <div className="label">
        {[...label].map((char, index) => <i key={index} style={{ '--k': index } as CSSProperties}>{char}</i>)}
      </div>
    </div>
  )
}
