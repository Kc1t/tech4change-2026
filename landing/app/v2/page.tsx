import type { Metadata } from 'next'
import '../v2.css'
import { Hero } from '@/components/v2/hero'

export const metadata: Metadata = {
  title: 'Eilo — mais presença no seu dia',
  description:
    'O eilo acompanha, entende e ajuda a pessoa com afasia no dia a dia — pela fala, no celular, no relógio ou nos fones.'
}

export default function Page() {
  return (
    <main className="bg-white">
      <Hero />
    </main>
  )
}
