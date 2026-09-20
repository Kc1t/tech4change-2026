import { GraphCanvas } from './graph-canvas'

const SEED = { owner: 'Helena', person: 'Letícia', place: 'Sorocaba' }

export function MomentStill() {
  return (
    <div className="flex h-full flex-col bg-ink px-4 pt-8 pb-4 text-fg">
      <div className="flex items-center justify-between">
        <span className="label-caps">domingo, 11h04</span>
        <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold text-faint">
          <i className="block size-1.5 animate-pulse rounded-full bg-mastery-low" />
          escutando
        </span>
      </div>

      <div className="mt-3 flex gap-1 rounded-full border border-line-soft p-0.5">
        <span className="flex-1 rounded-full py-1.5 text-center text-[0.72rem] font-semibold text-faint">
          Dica
        </span>
        <span className="flex-1 rounded-full bg-fg py-1.5 text-center text-[0.72rem] font-semibold text-ink">
          Escada
        </span>
      </div>
      <p className="label-caps mt-1.5 text-center">sobe degrau a degrau</p>

      <p className="mt-3 rounded-2xl rounded-bl-sm border border-line-soft px-3 py-2 text-[0.88rem] leading-snug">
        <span className="label-caps mb-0.5 block">Helena</span>
        É a minha… a minha…
      </p>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="rounded-xl border border-line-soft px-3 py-2 opacity-45">
          <span className="label-caps">degrau 1 · categoria</span>
          <p className="mt-0.5 text-[0.95rem] leading-snug">é da família</p>
        </div>
        <div className="rounded-xl border border-line-soft px-3 py-2">
          <span className="label-caps">degrau 2 · relação</span>
          <p className="mt-0.5 text-[0.95rem] leading-snug">da geração dos netos</p>
        </div>
      </div>

      <div className="mt-auto w-full rounded-full bg-primary py-3.5 text-center text-[0.9rem] font-bold text-primary-foreground">
        Travou
      </div>
    </div>
  )
}

export function GraphStill() {
  return (
    <div className="flex h-full flex-col bg-ink px-4 pt-8 pb-4 text-fg">
      <span className="label-caps">o seu mapa</span>
      <p className="mt-1 text-[1.05rem] leading-snug font-medium tracking-[-0.03em]">
        24 pessoas, 11 lugares
      </p>

      <div className="mt-4">
        <GraphCanvas seed={SEED} present={['owner', 'person', 'place']} />
      </div>

      <dl className="mt-auto flex flex-col gap-1.5">
        {[
          { tone: 'bg-mastery-high', label: 'sai sozinha', value: '14' },
          { tone: 'bg-mastery-medium', label: 'precisa de um degrau', value: '7' },
          { tone: 'bg-mastery-low', label: 'precisa da escada', value: '3' }
        ].map(row => (
          <div key={row.label} className="flex items-center gap-2 text-[0.72rem]">
            <i className={`block size-2 rounded-full ${row.tone}`} />
            <dt className="text-dim">{row.label}</dt>
            <dd className="tabular ml-auto font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function PanelStill() {
  const BARS = [3.8, 3.6, 3.1, 2.9, 2.4]

  return (
    <div className="flex h-full flex-col bg-ink px-4 pt-8 pb-4 text-fg">
      <span className="label-caps">semana de 9 a 15 de setembro</span>
      <p className="display mt-1 text-[2.4rem] leading-none">86</p>
      <p className="text-[0.78rem] leading-snug text-dim">
        bloqueios que aconteceram fora da sessão
      </p>

      <div className="mt-5">
        <span className="label-caps">degrau médio</span>
        <div className="mt-2 flex h-20 items-end gap-1.5">
          {BARS.map((bar, i) => (
            <span
              key={bar}
              className={`flex-1 rounded-t-sm ${i === BARS.length - 1 ? 'bg-primary' : 'bg-line'}`}
              style={{ height: `${(bar / 4) * 100}%` }}
            />
          ))}
        </div>
        <p className="mt-2 text-[0.7rem] text-faint">de 3,8 para 2,4 em cinco semanas</p>
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        {[
          { word: 'Letícia', level: '2' },
          { word: 'farmácia', level: '4' },
          { word: 'Sorocaba', level: '1' }
        ].map(row => (
          <div
            key={row.word}
            className="flex items-center justify-between rounded-xl border border-line-soft px-3 py-2"
          >
            <span className="text-[0.85rem]">{row.word}</span>
            <span className="label-caps">degrau {row.level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
