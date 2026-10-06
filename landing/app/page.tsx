import type { Metadata } from 'next'
import './v3.css'
import { ClinicianPanel } from '@/components/v3/clinician-panel'
import { Faq } from '@/components/v3/faq'
import { Footer } from '@/components/v3/footer'
import { HelpChat } from '@/components/v3/help-chat'
import { Hero } from '@/components/v3/hero'
import { How } from '@/components/v3/how'
import { Invite } from '@/components/v3/invite'
import { Journey } from '@/components/v3/journey'
import { Principles } from '@/components/v3/principles'
import { Screens } from '@/components/v3/screens'
import { Surfaces } from '@/components/v3/surfaces'
import { Trailer } from '@/components/v3/trailer'
import { Walkthrough } from '@/components/v3/walkthrough'

export const metadata: Metadata = {
  title: 'Eilo, o caminho até a palavra',
  description:
    'Depois de um AVC, a palavra some no meio da frase. O eilo escuta a conversa, entende quem está por perto e devolve o caminho até ela.'
}

export default function Page() {
  return (
    <main className="v3">
      <Hero />
      <Trailer />
      <Journey />
      <Walkthrough />
      <ClinicianPanel />
      <How />
      <Screens />
      <Surfaces />
      <Principles />
      <Faq />
      <Invite />
      <Footer />
      <HelpChat />
    </main>
  )
}
