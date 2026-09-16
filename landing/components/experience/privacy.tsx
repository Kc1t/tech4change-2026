import { PayloadProof } from '@/components/payload-proof'
import { Reveal } from './reveal'

export function Privacy() {
  return (
    <section id="privacidade" className="night relative overflow-hidden py-24 sm:py-32">
      <img
        src="/story/scene-phone.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-center opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--night)] via-[rgba(20,14,12,0.8)] to-[var(--night)]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
            privacidade, por construção
          </p>
          <h2 className="mt-5 max-w-3xl text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.035em] text-white text-balance">
            A palavra nunca
            <span className="display italic"> sai do aparelho.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-white/70">
            O servidor ranqueia candidatos sobre uma projeção do grafo sem rótulo nenhum, devolve
            identificadores, e o aparelho resolve os identificadores de volta em texto. Não é uma
            promessa de política de privacidade: o schema da API recusa qualquer coisa que pareça
            uma palavra, e uma requisição com nome próprio volta com erro 400.
          </p>
        </Reveal>

        <Reveal delay={140} className="mt-12">
          <PayloadProof />
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-8 max-w-2xl text-[0.95rem] leading-relaxed text-white/55">
            A mesma regra vale para a ponte entre aparelhos. Um código de quatro dígitos liga celular
            e relógio, e a dica acende nos dois ao mesmo tempo — só que o que trafega é
            identificador, nível e aresta. Cada aparelho traduz para texto com o grafo que já tem.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
