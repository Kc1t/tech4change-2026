import { Reveal } from './reveal'

const NUMBERS = [
  { value: '17%', label: 'das palavras falhadas saem com pista fonológica' },
  { value: '168h', label: 'tem a semana de quem vive com afasia' },
  { value: '1h', label: 'dela tem a fonoaudióloga por perto' }
]

export function NumbersBar() {
  return (
    <section className="border-b border-line bg-ink">
      <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-3">
        {NUMBERS.map((number, i) => (
          <Reveal key={number.value} delay={i * 90}>
            <div className="h-full bg-ink px-6 py-8">
              <p className="display tabular text-[2.6rem] leading-none text-primary">
                {number.value}
              </p>
              <p className="mt-3 text-[0.95rem] leading-snug text-dim">{number.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
