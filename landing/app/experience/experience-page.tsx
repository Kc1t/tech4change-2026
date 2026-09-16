import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Hero } from '@/components/experience/hero'
import { Install } from '@/components/experience/install'
import { MomentScene } from '@/components/experience/moment-scene'
import { NumbersBar } from '@/components/experience/numbers-bar'
import { Product } from '@/components/experience/product'
import { Reveal } from '@/components/experience/reveal'
import { Why } from '@/components/experience/why'

const FAQ = [
  {
    q: 'Isso já não existe?',
    a: 'Existem duas famílias de coisa, e nenhuma delas ocupa este lugar. A prancha de comunicação alternativa é um caderno de figuras: está presente na hora, mas é preciso procurar, e ela não sabe quem é a Letícia. Os aplicativos de exercício treinam nomeação em outra hora do dia, longe da conversa em que a palavra travou. A lacuna não é um recurso a mais — é outro momento de uso: o segundo em que a palavra falta, com um índice pessoal por trás.'
  },
  {
    q: 'De onde vêm esses números?',
    a: 'Os 17% são de Bislick, n=100: itens falhados no Boston Naming Test resolvidos por pista fonológica, contra cerca de 1% para pista semântica. As 168 horas são a semana inteira, e a sessão de fonoaudiologia costuma ser uma delas. O AVC custa R$ 30,8 bilhões por ano no Brasil, 70% disso indireto, absorvido pelas famílias. E o denominador de fonoaudiólogos que usamos é 9.158 — os de neuro adulto — e não os 61.054 do total do país, porque esse é o número honesto.'
  },
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
    a: 'Não. O áudio vive num buffer circular em memória, sobrescrito continuamente e nunca persistido em disco. E a API é auditável nesse ponto: ela rejeita qualquer requisição que contenha texto livre — identificadores precisam ser opacos, e uma tentativa de enviar um nome próprio volta com erro 400. A mesma regra vale entre celular e relógio: o que trafega é identificador, nível e aresta.'
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
      <Product />
      <Why />
      <Install />

      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="label-caps">perguntas que a banca faz</p>
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
