import type { Metadata, Viewport } from 'next'
import { TryApp } from './try-app'

export const metadata: Metadata = {
  title: 'Experimentar o Eilo',
  description: 'Fale com o eilo no navegador e veja as pistas levarem você até a palavra, uma de cada vez.'
}

export const viewport: Viewport = {
  themeColor: '#f6f5fb'
}

export default function Page() {
  return <TryApp />
}
