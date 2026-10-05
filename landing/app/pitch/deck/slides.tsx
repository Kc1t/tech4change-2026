import { ClinicianDashboard } from '../clinician/dashboard'
import { AiRole } from '../slides/ai-role'
import { Closing } from '../slides/closing'
import { Competitors } from '../slides/competitors'
import { Cover } from '../slides/cover'
import { Devices } from '../slides/devices'
import { GoToMarket } from '../slides/go-to-market'
import { Impact } from '../slides/impact'
import { InterviewsNumbers } from '../slides/interviews-numbers'
import { LiveDemoSlide } from '../slides/live-demo'
import { MarketScale } from '../slides/market'
import { NextSteps } from '../slides/next-steps'
import { Problem } from '../slides/problem'
import { Solution } from '../slides/solution'
import { Team } from '../slides/team'
import { Vibration } from '../slides/vibration'
import type { SlideEntry } from './types'

export const SLIDES: SlideEntry[] = [
  { part: 'Problema', name: 'Nenhum deles esqueceu', bare: true, steps: 4, render: props => <Cover {...props} /> },
  { part: 'Problema', name: 'O problema', label: 'O problema', render: () => <Problem /> },
  { part: 'Problema', name: 'O que ouvimos', label: 'O que ouvimos', render: () => <InterviewsNumbers /> },
  { part: 'Solução', name: 'A solução', label: 'A solução', render: () => <Solution /> },
  { part: 'Solução', name: 'Demo ao vivo', label: 'Como funciona', listens: true, render: () => <LiveDemoSlide /> },
  { part: 'Solução', name: 'O papel da IA', label: 'O papel da IA', render: () => <AiRole /> },
  { part: 'Solução', name: 'A vibração', label: 'A vibração', render: () => <Vibration /> },
  { part: 'Solução', name: 'Qualquer aparelho', label: 'Qualquer aparelho', render: () => <Devices /> },
  { part: 'Solução', name: 'Painel da fono', label: 'O que a fono vê', render: () => <ClinicianDashboard /> },
  { part: 'Negócio', name: 'Concorrentes', label: 'Concorrentes', render: () => <Competitors /> },
  { part: 'Negócio', name: 'Mercado e escala', label: 'Mercado e escala', render: () => <MarketScale /> },
  { part: 'Negócio', name: 'Go-to-market e preço', label: 'Go-to-market e preço', render: () => <GoToMarket /> },
  { part: 'Negócio', name: 'Impacto', label: 'Impacto', render: () => <Impact /> },
  { part: 'Fecho', name: 'Time', label: 'Quem somos', render: () => <Team /> },
  { part: 'Fecho', name: 'Fecho', bare: true, render: () => <Closing /> },
  { part: 'Apêndice', name: 'Próximos passos', label: 'Próximos passos', render: () => <NextSteps /> }
]
