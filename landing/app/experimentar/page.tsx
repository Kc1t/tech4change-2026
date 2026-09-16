import type { Metadata } from 'next'
import '../v3.css'
import { DemoFlow } from '@/components/demo/demo-flow'

export const metadata: Metadata = {
  title: 'Experimentar o Eilo',
  description:
    'Monte o seu mapa em três perguntas e veja a escada alcançar a palavra, degrau a degrau.'
}

export default function Page() {
  return <DemoFlow />
}
