'use client'

import { useMemo, type ReactNode } from 'react'
import { planSpeech, type Mark } from '@/channels/entrain'

interface SpokenPhraseProps {
  text: string
  mark: Mark | null
}

export function SpokenPhrase({ text, mark }: SpokenPhraseProps) {
  const plan = useMemo(() => planSpeech(text), [text])

  if (!mark || plan.length === 0) return <>{text}</>

  const pieces: ReactNode[] = []
  let cursor = 0

  plan.forEach((word, wordIndex) => {
    if (word.charIndex > cursor) pieces.push(text.slice(cursor, word.charIndex))

    let at = word.charIndex
    word.syllables.forEach((part, index) => {
      const live = wordIndex === mark.word && index === mark.syllable
      const passed =
        wordIndex < mark.word || (wordIndex === mark.word && index < mark.syllable)

      pieces.push(
        <span
          key={`${wordIndex}-${index}`}
          className={[
            'transition-opacity duration-150',
            live ? 'opacity-100' : passed ? 'opacity-60' : 'opacity-25'
          ].join(' ')}
        >
          {text.slice(at, at + part.length)}
        </span>
      )
      at += part.length
    })

    cursor = at
  })

  if (cursor < text.length) pieces.push(text.slice(cursor))

  return <>{pieces}</>
}
