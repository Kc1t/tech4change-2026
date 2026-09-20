import { ChevronRight, Headphones, Radio, Smartphone, Watch } from 'lucide-react'

const SURFACES = [
  { icon: Watch, title: 'No relógio', body: 'Um toque discreto' },
  { icon: Smartphone, title: 'No celular', body: 'No contexto certo' },
  { icon: Headphones, title: 'No fone', body: 'Como um sussurro' }
]

export function ReachCard() {
  return (
    <section className="v3-glass rounded-[1.5rem] px-7 py-6">
      <header className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#e9e2fa] text-[var(--v3-accent)]">
            <Radio className="size-4" />
          </span>
          <span className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--v3-accent-deep)] uppercase">
            Como chega até você
          </span>
        </span>
        <span className="flex items-center gap-1 text-[0.84rem] text-[var(--v3-muted)]">
          No seu ritmo, onde você estiver
          <ChevronRight className="size-4" />
        </span>
      </header>

      <ul className="mt-6 grid grid-cols-3 divide-x divide-[var(--v3-line)]">
        {SURFACES.map(surface => (
          <li key={surface.title} className="flex flex-col items-center px-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#eee9fa] text-[var(--v3-accent)]">
              <surface.icon className="size-6" />
            </span>
            <span className="mt-4 text-[0.92rem] font-semibold">{surface.title}</span>
            <span className="mt-1 text-[0.84rem] text-[var(--v3-muted)]">{surface.body}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
