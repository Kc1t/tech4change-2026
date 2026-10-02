'use client'

import { useEffect, useRef, useState } from 'react'
import { Device, ScreenMoment } from './app-screens'
import { PhoneShell } from './phone'
import { Reveal } from './reveal'
import { usePrefersReducedMotion } from './use-reduced-motion'

const STEP_MS = 4600

const STEPS = [
  {
    title: 'Um toque liga a escuta',
    body: 'Ele só ouve depois que você toca, e outro toque pausa. Nada é gravado: o som vira texto na hora e é descartado.',
    state: 'waiting',
    heard: 'Quem que vem no domingo?'
  },
  {
    title: 'A conversa segue normal',
    body: 'Enquanto você fala, ele acompanha de quem é a história: a neta, a cidade, o cachorro. É o mapa da sua vida, que a família confirma uma vez.',
    state: 'listening',
    heard: 'Ontem a minha neta veio, a que mora em Sorocaba…'
  },
  {
    title: 'A palavra some e ele percebe',
    body: 'Basta a pausa no meio da frase, sem botão nenhum. Você escolhe quanto tempo ele espera: com calma, no meio ou mais rápido.',
    state: 'listening',
    heard: 'Ontem a minha neta veio, a que mora em Sorocaba. A… a…'
  },
  {
    title: 'Uma pista por vez',
    body: 'Primeiro a mais distante, “é da família”. Depois a relação, o lugar e só no fim o começo do som. Na tela, no fone ou como vibração no relógio.',
    state: 'cue',
    heard: 'Ontem a minha neta veio, a que mora em Sorocaba. A… a…'
  },
  {
    title: 'Você diz, ele percebe sozinho',
    body: 'Quando a palavra sai, ele reconhece na hora, comemora baixinho e volta a ouvir. Quem achou foi você. Da próxima vez, a pista começa mais longe.',
    state: 'word',
    heard: '…a Letícia! A Letícia veio me ver.'
  }
] as const

export function Walkthrough() {
  const still = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [manual, setManual] = useState(false)
  const playing = visible && !manual && !still

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setActive(index => (index + 1) % STEPS.length), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [playing, active])

  const step = STEPS[active]

  return (
    <section
      ref={ref}
      id="na-pratica"
      className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-20 sm:px-10 sm:pb-24"
    >
      <Reveal>
        <span className="inline-block rounded-full bg-[#efe9fb] px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
          Na prática
        </span>
        <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.1rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
          Um travamento, do começo ao fim.
        </h2>
        <p className="mt-5 max-w-[40rem] text-[1.02rem] leading-[1.7] text-[var(--v3-muted)]">
          Na vida real tudo isso leva poucos segundos. Aqui vai em câmera lenta, passo a passo.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="v3-tile-1 grid overflow-hidden rounded-[1.5rem] lg:grid-cols-[1fr_340px]">
          <ol className="flex flex-col justify-center gap-1 p-4 sm:p-6 lg:p-8">
            {STEPS.map((item, index) => {
              const current = index === active
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(index)
                      setManual(true)
                    }}
                    aria-current={current ? 'step' : undefined}
                    className={`flex w-full gap-4 rounded-[1.1rem] px-4 py-3.5 text-left transition-colors ${
                      current ? 'bg-white/80' : 'hover:bg-white/40'
                    }`}
                  >
                    <span
                      className={`tabular grid size-8 shrink-0 place-items-center rounded-full text-[0.8rem] font-semibold transition-colors ${
                        current ? 'bg-[var(--v3-accent)] text-white' : 'bg-white/70 text-[var(--v3-accent)]'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block pt-1 text-[1.02rem] leading-snug font-medium tracking-[-0.02em] transition-colors ${
                          current ? 'text-[var(--v3-ink)]' : 'text-[#5f5b72]'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                          current ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-1.5 text-[0.9rem] leading-relaxed text-[#6b687a]">
                            {item.body}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div aria-hidden="true" className="order-first flex items-end justify-center pt-8 lg:order-none lg:pt-10">
            <PhoneShell cropped className="relative h-[400px] w-[270px] sm:h-[480px]">
              <Device width={258}>
                <ScreenMoment state={step.state} heard={step.heard} orb={150} footer={20} bar={false} />
              </Device>
            </PhoneShell>
          </div>
          <p className="sr-only" aria-live="polite">
            Passo {active + 1}: {step.title}
          </p>
        </div>
      </Reveal>
    </section>
  )
}
