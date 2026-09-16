import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Instrument_Serif, Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap'
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap'
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'O caminho até a palavra',
  description:
    'Um app que ajuda quem teve AVC a alcançar a palavra que travou, no segundo em que ela falta.',
  icons: { icon: '/favicon.svg' }
}

export const viewport: Viewport = {
  themeColor: '#f2f2f0',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${instrumentSerif.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
