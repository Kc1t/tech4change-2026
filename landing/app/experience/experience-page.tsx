import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Aurora } from '@/components/aurora'
import { SeedForm } from '@/components/seed-form'
import { Clinician } from '@/components/experience/clinician'
import { Hero } from '@/components/experience/hero'
import { MapSection } from '@/components/experience/map-section'
import { MomentScene } from '@/components/experience/moment-scene'
import { NumbersBar } from '@/components/experience/numbers-bar'
import { Pillars } from '@/components/experience/pillars'
import { Privacy } from '@/components/experience/privacy'
import { Reveal } from '@/components/experience/reveal'

const FAQ = [
  {
    q: 'Isso substitui a fonoaudióloga?',
    a: 'Não, e o produto é desenhado para admitir isso. A quantidade de degraus é uma configuração do próprio fonoaudiólogo: de zero — entrega direta, modo conversa — até a escada inteira, modo treino. Quem decide se aquilo é prótese ou terapia naquela semana é ele, não o app.'
  },
  {
    q: 'É dispositivo médico?',
    a: 'É. A RDC 657/2022 lista reabilitação entre as exclusões de bem-estar, então o enquadramento não é evitável. Pela Regra 11 da RDC 751/2022 o produto é Classe I, por notificação — cerca de 30 dias, sem análise técnica prévia.'
  },
  {
    q: 'O app grava as conversas?',
    a: 'Não. O áudio vive num buffer circular em memória, sobrescrito continuamente e nunca persistido em disco. E a API é auditável nesse ponto: ela rejeita qualquer requisição que contenha texto livre — identificadores precisam ser opacos, e uma tentativa de enviar um nome próprio volta com erro 400.'
  },
  {
    q: 'Quem paga por isso no Brasil?',
    a: 'Ninguém reembolsa hoje, e o modelo foi montado sabendo disso. O SUS paga R$ 10,90 por sessão individual de fonoaudiologia e seus CIDs sequer incluem R47.0, afasia. Em 1.251 avaliações da CONITEC entre 2012 e 2026 não há uma única terapia digital. O preço fecha sem reembolso: R$ 119/mês para o fonoaudiólogo, R$ 59/mês para a família.'
  }
]

export function ExperienceApp() {
  return (
    <div className="min-h-dvh bg-ink">
      <Hero />
      <NumbersBar />
      <MomentScene />
      <MapSection />
      <Pillars />
      <Privacy />
      <Clinician />

      <section id="testar" className="relative isolate overflow-hidden py-24 sm:py-32">
        <Aurora className="absolute -top-[22%] -right-[12%] -z-10 w-[46%] max-w-[480px] opacity-30 blur-[6px]" />

        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-label uppercase">
              experimente agora
            </p>
            <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.06] font-medium tracking-[-0.035em] text-balance">
              Três perguntas e o aplicativo abre com
              <span className="display italic"> o seu mapa, não o nosso.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-dim">
              A demonstração de sempre usa a Helena, uma pessoa que não existe. Responda três
              perguntas e a escada passa a apontar para gente da sua vida — porque a única coisa que
              faz uma pista funcionar é ela ser sobre quem você conhece.
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-10">
            <SeedForm />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8 sm:pb-32">
        <Reveal>
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-label uppercase">
            perguntas que a banca faz
          </p>
          <Accordion type="single" collapsible className="mt-6 w-full">
            {FAQ.map(item => (
              <AccordionItem key={item.q} value={item.q} className="border-line-soft">
                <AccordionTrigger className="text-left text-[1.1rem] leading-snug font-medium tracking-[-0.03em] hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl text-[0.95rem] leading-relaxed text-dim">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <footer className="night px-5 py-16 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8">
          <p className="display text-[clamp(2.2rem,6vw,4rem)] leading-none text-white">
            A última palavra é sua.
          </p>
          <p className="text-[0.72rem] leading-relaxed text-white/45">
            Tech4Change 2026 · FIAP PosTech
            <br />
            Protótipo acadêmico. Não é produto registrado na ANVISA.
            <br />
            Cenas fotográficas geradas por IA, com atores sintéticos.
          </p>
        </div>
      </footer>
    </div>
  )
}
