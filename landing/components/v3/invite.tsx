import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowRight, Download, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Orb } from './orb'
import { Reveal } from './reveal'
import { TypingCue } from './typing-cue'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3010'

export function Invite() {
  const hasApk = existsSync(join(process.cwd(), 'public', 'eilo.apk'))

  return (
    <section id="baixar" className="mx-auto max-w-6xl px-6 pb-4 sm:px-10 sm:pb-6">
      <div className="pt-12 pb-4 text-center sm:pt-16">
        <Reveal>
          <Orb interactive className="mx-auto w-[clamp(152px,17vw,212px)]" />
        </Reveal>

        <Reveal delay={140}>
          <TypingCue />
        </Reveal>

        <Reveal delay={200}>
        <h2 className="mx-auto mt-14 max-w-2xl text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
          Deixe a palavra travar. Veja o caminho aparecer.
        </h2>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="v3-dark-btn h-12 rounded-xl px-7 text-[0.95rem] font-medium text-white"
          >
            <a href="/experimentar">
              Experimentar agora
              <ArrowRight className="size-4" />
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-xl border-[var(--v3-line)] bg-white px-7 text-[0.95rem] font-medium text-[var(--v3-ink)] hover:bg-[#f7f6fb]"
          >
            {hasApk ? (
              <a href="/eilo.apk" download>
                <Download className="size-4" />
                Baixar para Android
              </a>
            ) : (
              <a href={APP_URL}>
                <Globe className="size-4" />
                Abrir no navegador
              </a>
            )}
          </Button>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
