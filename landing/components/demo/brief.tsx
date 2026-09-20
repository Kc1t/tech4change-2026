import { ArrowRight, Fingerprint, ListOrdered, MousePointerClick, Pause } from 'lucide-react'

const RULES = [
  {
    icon: Pause,
    title: 'A palavra vai travar',
    body: 'Helena está contando quem apareceu no almoço de domingo e o nome da neta não vem. É esse segundo que a demonstração recria.'
  },
  {
    icon: MousePointerClick,
    title: 'Quem toca aqui é você',
    body: 'Isto roda no navegador, então o toque é seu. No celular ninguém aperta nada: a escuta percebe a pausa sozinha.'
  },
  {
    icon: ListOrdered,
    title: 'Cada toque sobe um degrau',
    body: 'A dica começa larga, na categoria, e só aperta se precisar. O último degrau é o som do começo da palavra.'
  },
  {
    icon: Fingerprint,
    title: 'A palavra é sempre sua',
    body: 'A IA ordena os degraus sobre o seu mapa usando identificadores opacos. Ela nunca vê o nome, e quem diz a palavra é você.'
  }
]

export function Brief({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--v3-accent)] uppercase">
          Antes de começar
        </p>
        <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,2.9rem)] leading-[1.12] font-medium tracking-[-0.035em] text-balance">
          Quatro coisas e você já sabe jogar.
        </h1>
        <p className="mt-5 text-[1.02rem] leading-[1.7] text-[var(--v3-muted)] text-balance">
          A demonstração tem uma regra só: toque quando a palavra não vier. O resto é o aplicativo
          fazendo o trabalho dele.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {RULES.map((rule, i) => (
          <article
            key={rule.title}
            className="flex gap-5 rounded-[1.5rem] border border-[var(--v3-line)] bg-white p-7"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#efeafb] text-[var(--v3-accent)]">
              <rule.icon className="size-[1.15rem]" />
            </span>
            <div className="min-w-0">
              <p className="tabular text-[0.72rem] font-semibold text-[#b6b0c6]">0{i + 1}</p>
              <h2 className="mt-1 text-[1.12rem] leading-snug font-semibold tracking-[-0.025em]">
                {rule.title}
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--v3-muted)]">
                {rule.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onStart}
          className="v3-dark-btn inline-flex h-13 items-center gap-2 rounded-xl px-8 text-[0.98rem] font-medium text-white"
        >
          Estou pronto
          <ArrowRight className="size-4" />
        </button>
        <p className="max-w-md text-center text-[0.8rem] leading-relaxed text-[#8f8aa0]">
          Nada disso sai desta aba. Não existe conta, não existe servidor guardando o que você
          responder.
        </p>
      </div>
    </div>
  )
}
