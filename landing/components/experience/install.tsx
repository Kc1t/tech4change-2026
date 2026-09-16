import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowRight, Download, Smartphone, Watch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3010'

const SURFACES = [
  {
    icon: Smartphone,
    title: 'Na mesa ou no bolso',
    body: 'Escuta o ambiente e percebe sozinho a pausa no meio da frase. Não precisa desbloquear nem apertar nada.'
  },
  {
    icon: Watch,
    title: 'No pulso',
    body: 'É onde ele é melhor: a dica acende só para quem está usando, e a mesa segue a conversa sem perceber.'
  }
]

export function Install() {
  const hasApk = existsSync(join(process.cwd(), 'public', 'eilo.apk'))

  return (
    <section id="baixar" className="night py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <p className="label-caps text-white/50">experimentar e levar</p>
            <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.05] font-medium tracking-[-0.035em] text-white text-balance">
              A demonstração roda no navegador.
              <span className="display italic"> O produto mora no seu bolso.</span>
            </h2>
            <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
              Três perguntas e a escada passa a apontar para gente da sua vida. Nada do que você
              digitar sai do navegador.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <a href="/experimentar">
                  Experimentar agora
                  <ArrowRight className="size-4" />
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="glass-dark rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                {hasApk ? (
                  <a href="/eilo.apk" download>
                    <Download className="size-4" />
                    Baixar para Android
                  </a>
                ) : (
                  <a href={APP_URL}>Abrir no celular</a>
                )}
              </Button>
            </div>

            <p className="mt-6 max-w-lg text-[0.74rem] leading-relaxed text-white/40">
              {hasApk
                ? 'Instalação fora da Play Store: o Android vai pedir para permitir origem desconhecida. Protótipo acadêmico, não registrado na ANVISA.'
                : 'Também roda como aplicativo web instalável — abra no celular e use "adicionar à tela inicial".'}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <ul className="flex flex-col gap-3">
              {SURFACES.map(surface => (
                <li key={surface.title} className="glass-dark rounded-[1.5rem] p-6">
                  <surface.icon className="size-5 text-brand-warm" />
                  <h3 className="mt-3 text-[1.05rem] leading-snug font-medium tracking-[-0.03em] text-white">
                    {surface.title}
                  </h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-white/65">{surface.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.72rem] leading-relaxed text-white/40">
              A ponte para o relógio é uma prova de conceito Wear OS e não acompanha o download.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
