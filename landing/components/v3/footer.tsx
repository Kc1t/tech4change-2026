import { Logo } from './logo'

const COLUMNS = [

  {
    title: 'Produto',
    links: [
      { label: 'O que é', href: '#jornada' },
      { label: 'Como funciona', href: '#como-funciona' },
      { label: 'As três telas', href: '#telas' },
      { label: 'Experimentar', href: '/experimentar' }
    ]
  },
  {
    title: 'Projeto',
    links: [
      { label: 'Hackathon Tech4Change 2026', href: '#' },
      { label: 'FIAP PosTech', href: '#' },
      { label: 'Privacidade', href: '#baixar' }
    ]
  }
]

export function Footer() {
  return (
    <div className="v3-foot-surface px-3 pt-24 pb-4 sm:px-4 sm:pt-32">
      <footer className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-white px-8 pt-12 sm:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.1fr]">
          <div>
            <a href="/v3" className="inline-flex items-center">
              <Logo className="h-8" />
            </a>
            <p className="mt-4 max-w-[22rem] text-[0.88rem] leading-[1.7] text-[var(--v3-muted)]">
              “Ei-lo”, aqui está. Um caminho até a palavra que travou, construído com quem convive
              com afasia depois de um AVC.
            </p>
          </div>

          {COLUMNS.map(column => (
            <div key={column.title}>
              <h3 className="text-[0.92rem] font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[0.85rem] text-[var(--v3-muted)] transition-colors hover:text-[var(--v3-ink)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[0.92rem] font-semibold">Levar com você</h3>
            <p className="mt-4 text-[0.85rem] leading-[1.7] text-[var(--v3-muted)]">
              Protótipo acadêmico, sem registro na ANVISA e fora das lojas. A ponte para o relógio é
              prova de conceito Wear OS. Cenas fotográficas geradas por IA, com atores sintéticos.
            </p>
          </div>
        </div>

        <img
          src="/brand/logo.webp"
          alt=""
          aria-hidden="true"
          className="mx-auto mt-10 w-[min(720px,86%)] opacity-[0.15] select-none"
        />
      </footer>
    </div>
  )
}
