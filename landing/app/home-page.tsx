import { ArrowRight, Code2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LadderDemo } from '@/components/ladder-demo'
import { PayloadProof } from '@/components/payload-proof'
import { SeedForm } from '@/components/seed-form'
import { Aurora } from '@/components/aurora'

const PRODUCT = 'Eilo'
const REPO = 'https://github.com/Kc1t/tech4change-2026'

const NUMBERS = [
  {
    value: '17%',
    label: 'dos itens falhados são resolvidos por pista fonológica',
    note: 'contra cerca de 1% para pista semântica — Bislick, n=100, Boston Naming Test'
  },
  {
    value: '168h',
    label: 'tem a semana de quem vive com afasia',
    note: 'a fonoaudióloga está presente em uma delas'
  },
  {
    value: 'R$ 30,8 bi',
    label: 'de custo anual do AVC no Brasil',
    note: '70% disso é custo indireto, absorvido pelas famílias'
  }
]

const PILLARS = [
  {
    step: '01',
    title: 'O mapa se monta sozinho',
    body: 'Fotos e áudios do próprio aparelho viram um grafo de pessoas, lugares e objetos. Visão computacional agrupa os rostos, os metadados da foto dão lugar e data, e a família confirma uma vez — só ela sabe que aquele rosto é a Letícia. Ninguém preenche formulário toda semana, que é por onde produtos parecidos são abandonados.'
  },
  {
    step: '02',
    title: 'A escada, não a resposta',
    body: 'Quando a palavra trava, o sistema não entrega a palavra. Entrega um degrau: a categoria, depois a relação, depois o lugar, e só no fim a primeira sílaba. Cada degrau cita uma aresta que existe no grafo — se o modelo inventar uma ligação, a resposta inteira é recusada.'
  },
  {
    step: '03',
    title: 'A escada encurta',
    body: 'Destravou no degrau 4? Da próxima vez a dica começa no 3. O indicador de sucesso é o degrau médio caindo. É uma ferramenta construída para deixar de ser necessária.'
  }
]

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

export function App() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-6">
        <span className="flex items-baseline gap-2 text-lg font-semibold tracking-[-0.04em] lowercase">
          <i aria-hidden="true" className="brand-mark translate-y-[-1px]" />
          {PRODUCT}
        </span>
        <Button asChild variant="ghost" size="sm" className="ml-auto text-dim">
          <a href={REPO} target="_blank" rel="noreferrer">
            <Code2 className="size-4" />
            repositório
          </a>
        </Button>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-24 px-5 pb-24">
        <section className="relative grid items-center gap-12 pt-8 md:grid-cols-[1fr_auto] md:pt-16">
          <Aurora className="absolute -left-[26%] -top-[62%] -z-10 w-[64%] max-w-[560px] opacity-40 blur-[2px] md:-left-[32%]" />

          <div className="relative max-w-xl">
            <Badge variant="outline" className="border-line text-faint">
              afasia pós-AVC
            </Badge>
            <h1 className="voice mt-5 text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.05] text-balance">
              Ele sabe qual é a palavra. E não diz.
            </h1>
            <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-dim">
              Cerca de um em cada três sobreviventes de AVC fica com afasia, e o sintoma mais comum
              dela é não achar a palavra. A palavra não sumiu — o caminho até ela sumiu. Este
              aplicativo reconstrói o caminho, no segundo em que ela falta.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#como-funciona">
                  Como funciona
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-line">
                <a href="#testar">Testar com o seu nome</a>
              </Button>
            </div>
            <p className="voice mt-8 text-lg text-faint">O caminho até a palavra.</p>
          </div>

          <LadderDemo />
        </section>

        <section className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {NUMBERS.map(number => (
            <div key={number.value} className="bg-surface p-6">
              <p className="voice tabular text-[2rem] leading-none">{number.value}</p>
              <p className="mt-3 text-sm leading-snug">{number.label}</p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-faint">{number.note}</p>
            </div>
          ))}
        </section>

        <section id="testar" className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="label-caps">experimente agora</p>
            <h2 className="voice mt-3 text-[clamp(1.7rem,4vw,2.4rem)] leading-tight text-balance">
              Três perguntas e o aplicativo abre com o seu mapa, não com o nosso.
            </h2>
            <p className="mt-4 text-dim">
              A demonstração de sempre usa a Helena, uma pessoa que não existe. Responda três
              perguntas e a escada passa a apontar para gente da sua vida — porque a única coisa que
              faz uma pista funcionar é ela ser sobre quem você conhece.
            </p>
          </div>

          <SeedForm />
        </section>

        <section id="como-funciona" className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="label-caps">como funciona</p>
            <h2 className="voice mt-3 text-[clamp(1.7rem,4vw,2.4rem)] leading-tight text-balance">
              O nome da sua neta não está nos pesos de nenhum modelo de linguagem.
            </h2>
            <p className="mt-4 text-dim">
              Nenhuma IA do mundo sabe quem é a Letícia. Só um índice pessoal resolve nome próprio —
              e é por isso que o grafo precisa se montar sozinho, do aparelho da própria pessoa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map(pillar => (
              <Card key={pillar.step} className="border-line bg-surface">
                <CardHeader>
                  <span className="label-caps tabular">{pillar.step}</span>
                  <CardTitle className="voice text-xl leading-snug font-normal">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-dim">{pillar.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="privacidade" className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="label-caps">privacidade, por construção</p>
            <h2 className="voice mt-3 text-[clamp(1.7rem,4vw,2.4rem)] leading-tight text-balance">
              A palavra nunca sai do aparelho.
            </h2>
            <p className="mt-4 text-dim">
              O servidor ranqueia candidatos sobre uma projeção do grafo sem rótulo nenhum, devolve
              identificadores, e o aparelho resolve os identificadores de volta em texto. Não é uma
              promessa de política de privacidade: o schema da API recusa qualquer coisa que pareça
              uma palavra, e uma requisição com nome próprio volta com erro.
            </p>
            <p className="mt-3 text-dim">
              A mesma regra vale para a ponte entre aparelhos. Um código de quatro dígitos liga
              celular e relógio, e a dica acende nos dois ao mesmo tempo — só que o que trafega é
              identificador, nível e aresta. Cada aparelho traduz para texto com o grafo que já tem.
            </p>
          </div>

          <PayloadProof />
        </section>

        <section className="flex flex-col gap-6">
          <div className="max-w-2xl">
            <p className="label-caps">para o fonoaudiólogo</p>
            <h2 className="voice mt-3 text-[clamp(1.7rem,4vw,2.4rem)] leading-tight text-balance">
              Oitenta e seis bloqueios que aconteceram fora da sessão.
            </h2>
            <p className="mt-4 text-dim">
              A sessão de quarta-feira mostra o que a pessoa consegue fazer numa sala com um
              profissional ao lado. O painel mostra o que ela consegue fazer no domingo, na cozinha,
              com a família em volta — e quantos degraus precisou.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <p className="label-caps">perguntas que a banca faz</p>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map(item => (
              <AccordionItem key={item.q} value={item.q} className="border-line-soft">
                <AccordionTrigger className="voice text-left text-lg leading-snug hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl text-sm leading-relaxed text-dim">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-16">
        <Separator className="bg-line" />
        <div className="flex flex-wrap items-end justify-between gap-6 pt-8">
          <p className="voice text-[clamp(1.6rem,4vw,2.2rem)] leading-none">
            A última palavra é sua.
          </p>
          <p className="text-[0.72rem] leading-relaxed text-faint">
            Tech4Change 2026 · FIAP PosTech
            <br />
            Protótipo acadêmico. Não é produto registrado na ANVISA.
          </p>
        </div>
      </footer>
    </div>
  )
}
