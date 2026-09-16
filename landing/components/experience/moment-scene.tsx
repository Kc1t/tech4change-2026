'use client'

import { useScrollProgress } from './use-scroll-progress'

const STEPS = [
  {
    image: '/story/scene-stuck.webp',
    alt: 'O avô, de perfil, com o olhar procurando algo que não está na sala.',
    focus: 'object-[42%_28%]',
    kicker: 'travou',
    rung: 'a pausa',
    text: 'É a minha… a minha…',
  },
  {
    image: '/story/scene-phone.webp',
    alt: 'Um celular deitado na mesa entre os pratos, a tela com um brilho rosado.',
    focus: 'object-center',
    kicker: 'degrau 1 · categoria',
    rung: 'é da família',
    text: 'é da família',
  },
  {
    image: '/story/scene-watch.webp',
    alt: 'Close no pulso do avô. A tela do relógio acende com um brilho discreto.',
    focus: 'object-[55%_50%]',
    kicker: 'degrau 2 · relação',
    rung: 'da geração dos netos',
    text: 'da geração dos netos',
  },
  {
    image: '/story/scene-granddaughter.webp',
    alt: 'O avô e a neta, lado a lado, no instante em que ele diz o nome dela.',
    focus: 'object-[50%_32%]',
    kicker: 'degrau 3 · fonológica',
    rung: 'Le…',
    text: 'Le…',
  }
]

export function MomentScene() {
  const [ref, progress] = useScrollProgress<HTMLElement>()

  const raw = progress * STEPS.length
  const active = Math.min(STEPS.length - 1, Math.max(0, Math.floor(raw)))
  const local = Math.min(1, Math.max(0, raw - active))
  const resolved = progress > 0.9

  return (
    <section id="o-segundo" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 isolate h-[100svh] overflow-hidden">
        {STEPS.map((step, i) => (
          <img
            key={step.image}
            src={step.image}
            alt={step.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 -z-20 size-full object-cover ${step.focus} transition-opacity duration-700 ease-out ${
              active === i ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: active === i ? `scale(${1.08 - local * 0.08})` : 'scale(1.08)' }}
          />
        ))}

        <div className="scrim absolute inset-0 -z-10" />
        <div className="scrim-side absolute inset-0 -z-10 hidden md:block" />

        <div className="relative flex h-full flex-col justify-between px-5 py-6 sm:px-8 sm:py-12 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-white/55 uppercase">
              o segundo em que ela falta
            </p>
            <h2 className="mt-3 text-[clamp(1.55rem,4.2vw,3.2rem)] leading-[1.02] font-medium tracking-[-0.035em] text-white text-balance sm:mt-4">
              A escada não entrega a palavra.
              <span className="display block italic">Entrega um degrau.</span>
            </h2>

            <ol className="mt-5 flex gap-2 sm:mt-8" aria-hidden="true">
              {STEPS.map((step, i) => (
                <li
                  key={step.kicker}
                  className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
                    i <= active ? 'bg-brand-warm' : 'bg-white/25'
                  }`}
                />
              ))}
            </ol>
          </div>

          <div className="w-full max-w-md lg:max-w-sm">
            <div className="flex flex-col gap-2 sm:gap-2.5" aria-live="polite">
              {STEPS.map((step, i) => (
                <div
                  key={step.rung}
                  className={`glass-dark ease-out-quint rounded-2xl px-4 py-2.5 transition-[opacity,transform] duration-700 sm:py-3.5 ${
                    i <= active
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-6 opacity-0'
                  } ${i < active && !resolved ? 'opacity-55' : ''}`}
                >
                  <p className="text-[0.66rem] font-semibold tracking-[0.14em] text-white/55 uppercase">
                    {step.kicker}
                  </p>
                  <p className="mt-0.5 text-[1rem] leading-snug text-white sm:mt-1 sm:text-[1.15rem]">{step.text}</p>
                </div>
              ))}
            </div>

            <div
              className={`glass-light ease-out-quint mt-3 rounded-2xl px-5 py-4 transition-[opacity,transform] duration-700 sm:py-5 ${
                resolved ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
              }`}
            >
              <p className="label-caps">
                quem disse a palavra foi ele
              </p>
              <p className="display mt-1 text-[2rem] leading-none text-primary sm:text-[2.6rem]">Letícia</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-dim sm:mt-3 sm:text-[0.82rem]">
                Em 4 degraus. Da próxima vez, a dica começa no 3 — a escada encurta até deixar de
                ser necessária.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
