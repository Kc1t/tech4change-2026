import { Plus } from 'lucide-react'
import { QUESTIONS } from './faq-data'
import { Reveal } from './reveal'


export function Faq() {
  return (
    <section id="duvidas" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-24 sm:px-10 sm:pb-32">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <span className="inline-block rounded-full bg-[#efe9fb] px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
            Dúvidas
          </span>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
            O que a família costuma perguntar.
          </h2>
          <p className="mt-5 max-w-[26rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
            Respostas curtas, do jeito que o eilo funciona hoje.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="grid gap-3">
            {QUESTIONS.map(item => (
              <details
                key={item.question}
                className="group rounded-[1.25rem] bg-white shadow-[0_18px_44px_-36px_rgba(70,55,120,0.65)] open:shadow-[0_18px_44px_-30px_rgba(70,55,120,0.7)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-[1.02rem] font-medium tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <Plus className="size-4 shrink-0 text-[var(--v3-accent)] transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-[var(--v3-muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
