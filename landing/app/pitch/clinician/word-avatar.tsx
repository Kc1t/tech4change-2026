import type { Word } from './data'

export function WordAvatar({ word, round = false, size }: { word: Word; round?: boolean; size?: number }) {
  const style = size ? { width: size, height: size, fontSize: size * 0.42 } : undefined
  if (word.photo) return <img className={`cd-word-photo${round ? ' round' : ''}`} style={style} src={word.photo} alt="" />
  return (
    <span className={`cd-word-photo cd-kind--${word.kind}${round ? ' round' : ''}`} style={style}>
      {word.label.slice(0, 1).toUpperCase()}
    </span>
  )
}
