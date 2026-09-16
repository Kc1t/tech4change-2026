import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowRight, Download, Globe } from 'lucide-react'
import { PhoneShell, ScreenLadder, ScreenListening } from './phone'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3010'

export function Cta() {
  const hasApk = existsSync(join(process.cwd(), 'public', 'eilo.apk'))

  return (
    <section id="baixar" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
      <div className="v3-cta-surface relative grid min-h-[320px] overflow-hidden rounded-[1.75rem] px-9 py-12 text-white sm:px-14 sm:py-16 lg:grid-cols-2">
        <div className="relative z-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-medium tracking-[-0.03em]">
            Comece hoje.
          </h2>
          <p className="mt-4 max-w-[26rem] text-[1rem] leading-[1.7] text-white/70">
            Três perguntas e a escada passa a apontar para gente da sua vida. A demonstração roda no
            navegador; o produto mora no bolso.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/experimentar"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[0.92rem] font-medium text-[var(--v3-ink)] transition-transform hover:scale-[1.02]"
            >
              Experimentar agora
              <ArrowRight className="size-4" />
            </a>

            {hasApk ? (
              <a
                href="/eilo.apk"
                download
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-[0.92rem] font-medium text-white transition-colors hover:bg-white/20"
              >
                <Download className="size-4" />
                Baixar para Android
              </a>
            ) : (
              <a
                href={APP_URL}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-[0.92rem] font-medium text-white transition-colors hover:bg-white/20"
              >
                <Globe className="size-4" />
                Abrir no navegador
              </a>
            )}
          </div>

          <p className="mt-7 max-w-[28rem] text-[0.74rem] leading-relaxed text-white/45">
            {hasApk
              ? 'Instalação fora da Play Store: o Android vai pedir para permitir origem desconhecida. Protótipo acadêmico, não registrado na ANVISA.'
              : 'Ainda não está em nenhuma loja. Roda como aplicativo web instalável. Abra no celular e use “adicionar à tela inicial”.'}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-14 -bottom-36 hidden h-[420px] w-[360px] lg:block"
        >
          <div className="absolute top-0 left-0 z-10 h-[360px] w-[178px] rotate-[-8deg]">
            <PhoneShell cropped className="h-full w-full">
              <ScreenListening />
            </PhoneShell>
          </div>
          <div className="absolute top-8 left-[166px] h-[360px] w-[178px] rotate-[-8deg]">
            <PhoneShell cropped className="h-full w-full">
              <ScreenLadder />
            </PhoneShell>
          </div>
        </div>
      </div>
    </section>
  )
}
