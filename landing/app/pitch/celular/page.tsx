import type { Metadata, Viewport } from 'next'
import './phone-page.css'
import { PhoneDemo } from './phone-demo'

export const metadata: Metadata = {
  title: 'Eilo',
  robots: { index: false, follow: false }
}

export const viewport: Viewport = {
  themeColor: '#f6f5fb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function Page() {
  return <PhoneDemo />
}
