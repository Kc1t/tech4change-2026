const ON_DEVICE = `{
  "id": "n_fd8f8a",
  "label": "Letícia",
  "aliases": ["Lelê"],
  "attrs": {
    "family": "é da família",
    "generation": "da geração dos netos",
    "city": "mora em Sorocaba"
  },
  "phon": { "firstSyllable": "Le" }
}`

const ON_THE_WIRE = `{
  "id": "n_fd8f8a",
  "kind": "person",
  "attrKeys": ["family", "generation", "city"],
  "hasPhonology": true
}`

export function PayloadProof() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Pane
        title="fica no aparelho"
        note="Rótulos, apelidos, o texto de cada degrau e a primeira sílaba."
        code={ON_DEVICE}
        tone="fg"
      />
      <Pane
        title="chega ao servidor"
        note="Identificador opaco, tipo do nó, quais chaves de atributo existem. Nenhuma palavra."
        code={ON_THE_WIRE}
        tone="accent"
      />
    </div>
  )
}

function Pane({
  title,
  note,
  code,
  tone
}: {
  title: string
  note: string
  code: string
  tone: 'fg' | 'accent'
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface">
      <div className="flex items-baseline gap-2 border-b border-line-soft px-4 py-3">
        <span className={`label-caps ${tone === 'accent' ? 'text-primary' : ''}`}>{title}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.72rem] leading-relaxed text-dim">
        <code>{code}</code>
      </pre>
      <p className="border-t border-line-soft px-4 py-3 text-[0.72rem] leading-relaxed text-faint">
        {note}
      </p>
    </div>
  )
}
