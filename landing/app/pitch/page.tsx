import type { Metadata } from 'next'
import { Newsreader } from 'next/font/google'
import { Deck } from './deck/deck'

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-newsreader',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Eilo · Pitch',
  robots: { index: false, follow: false }
}

export default function Page() {
  return (
    <div className={newsreader.variable}>
      <Deck />
    </div>
  )
}
