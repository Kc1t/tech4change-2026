import type { Metadata } from 'next'
import '../v3.css'
import { FonoDashboard } from '@/components/fono/dashboard'

export const metadata: Metadata = {
  title: 'Painel do fono · eilo',
  description:
    'A evolução do paciente fora da sessão: o degrau médio semana a semana, palavra por palavra, ao vivo.'
}

export default function Page() {
  return (
    <div className="v3 min-h-dvh overflow-x-clip">
      <FonoDashboard />
    </div>
  )
}
