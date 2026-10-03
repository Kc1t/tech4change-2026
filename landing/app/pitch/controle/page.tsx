import type { Metadata, Viewport } from 'next'
import { DeckRemote } from './deck-remote'
import './deck-remote.css'

export const metadata: Metadata = {
  title: 'Eilo · Controle do pitch',
  robots: { index: false, follow: false }
}

export const viewport: Viewport = {
  themeColor: '#f6f5fb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function Page() {
  return <DeckRemote />
}
