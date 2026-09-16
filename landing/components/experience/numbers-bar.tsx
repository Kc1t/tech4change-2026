import { Reveal } from './reveal'

const NUMBERS = [
  {
    value: '17%',
    label: 'dos itens falhados saem com pista fonológica',
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
              <p className="mt-3 text-[0.95rem] leading-snug">{number.label}</p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-faint">{number.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
