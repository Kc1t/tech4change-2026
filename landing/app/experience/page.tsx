import type { Metadata } from 'next'
import '../experience.css'
import { ExperienceApp } from './experience-page'

export const metadata: Metadata = {
  title: 'Eilo — o segundo em que a palavra falta',
  description:
    'Um aplicativo que ajuda quem teve AVC a alcançar a palavra que travou, no segundo em que ela falta.'
}

export default function Page() {
  return <ExperienceApp />
}
