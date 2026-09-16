import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { SeedGate } from '@/components/SeedGate'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'O caminho até a palavra',
  description: 'Assistente de palavra para afasia pós-AVC',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' }
}

export const viewport: Viewport = {
  themeColor: '#f2f2f0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>
        <SeedGate>{children}</SeedGate>
      </body>
    </html>
  )
}
