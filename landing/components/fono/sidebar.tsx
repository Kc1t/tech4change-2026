import { ArrowLeft, FileText, Lock, Settings, Users } from 'lucide-react'
import { Logo } from '@/components/v3/logo'
import type { SubjectRow } from './api'
import { formatAgo, isRecent } from './format'
import { avatarTone, initialsOf } from './patients'

const AVATAR_SIZE = { md: 'size-9 text-[0.78rem]', lg: 'size-12 text-[1rem]', xl: 'size-[4.5rem] text-[1.4rem]' }

export function Avatar({
  subject,
  name,
  photo,
  size = 'md'
}: {
  subject: string
  name: string
  photo?: string
  size?: keyof typeof AVATAR_SIZE
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className={`shrink-0 rounded-full object-cover ring-2 ring-white ${AVATAR_SIZE[size]}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-bold ${avatarTone(subject)} ${AVATAR_SIZE[size]}`}
    >
      {initialsOf(name)}
    </span>
  )
}

const NAV = [
  { label: 'Pacientes', icon: Users, active: true },
  { label: 'Relatórios', icon: FileText, active: false },
  { label: 'Ajustes', icon: Settings, active: false }
]

export function Sidebar({
  subjects,
  selected,
  nameOf,
  photoOf,
  onSelect,
  loading,
  now
}: {
  subjects: SubjectRow[]
  selected: string | null
  nameOf: (subject: string) => string
  photoOf: (subject: string) => string | undefined
  onSelect: (subject: string) => void
  loading: boolean
  now: number
}) {
  return (
    <div className="border-b border-[#e6e3ef] bg-white lg:border-r lg:border-b-0">
      <aside className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 lg:px-5 lg:pt-6 lg:pb-5">
          <a
            href="/"
            aria-label="Voltar para a página inicial"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#8e7ff0] focus-visible:ring-offset-2"
          >
            <Logo className="h-6" />
          </a>
          <span className="h-4 w-px bg-[#e6e3ef]" aria-hidden="true" />
          <span className="text-[0.82rem] font-semibold text-[#57546a]">Painel do fono</span>
        </div>

        <nav aria-label="Seções" className="hidden px-3 lg:block">
          <ul className="flex flex-col gap-0.5">
            {NAV.map(item => (
              <li key={item.label}>
                {item.active ? (
                  <span
                    aria-current="page"
                    className="flex items-center gap-2.5 rounded-lg bg-[#f1eefb] px-3 py-2 text-[0.86rem] font-semibold text-[#433d56]"
                  >
                    <item.icon className="size-4 text-[#6b5fa8]" />
                    {item.label}
                  </span>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-[0.86rem] font-medium text-[#a3a0b2]"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                    <span className="ml-auto rounded-full bg-[#f4f3f8] px-2 py-0.5 text-[0.62rem] font-semibold text-[#8d8a9c]">
                      em breve
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col lg:mt-6">
          <p className="hidden px-5 pb-2 text-[0.66rem] font-bold tracking-[0.12em] text-[#8d8a9c] uppercase lg:block">
            Pacientes {subjects.length > 0 && <span className="tabular">· {subjects.length}</span>}
          </p>

          {loading ? (
            <div className="flex gap-2 px-4 pb-3 lg:flex-col lg:px-3" aria-busy="true">
              {[0, 1].map(key => (
                <span
                  key={key}
                  className="h-12 w-40 animate-pulse rounded-xl bg-[#f4f3f8] lg:w-auto"
                />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <p className="px-5 pb-3 text-[0.8rem] leading-relaxed text-[#6a6779]">
              Nenhum paciente ainda.
            </p>
          ) : (
            <ul className="flex gap-1.5 overflow-x-auto px-4 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-auto lg:px-3">
              {subjects.map(row => {
                const name = nameOf(row.subject)
                const active = row.subject === selected
                const live = isRecent(row.lastSeen, now)
                return (
                  <li key={row.subject} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => onSelect(row.subject)}
                      aria-current={active ? 'true' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8e7ff0] ${
                        active
                          ? 'border-[#dcd6f8] bg-[#f6f4fd]'
                          : 'border-transparent hover:bg-[#f8f7fc]'
                      }`}
                    >
                      <span className="relative">
                        <Avatar subject={row.subject} name={name} photo={photoOf(row.subject)} />
                        {live && (
                          <span className="absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-white">
                            <span className="v3-live-dot size-2 rounded-full bg-[#3fae7a]" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 pr-2 lg:flex-1">
                        <span
                          className={`block truncate text-[0.88rem] ${active ? 'font-bold text-[#1b1a22]' : 'font-semibold text-[#3a3846]'}`}
                        >
                          {name}
                        </span>
                        <span className="block truncate text-[0.74rem] text-[#6a6779]">
                          {live ? 'ativo agora' : formatAgo(row.lastSeen, now)}
                          <span className="hidden lg:inline"> · {row.events} eventos</span>
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="hidden items-start gap-2 px-5 pt-2 pb-4 text-[0.72rem] leading-relaxed text-[#8d8a9c] lg:flex">
            <Lock className="mt-0.5 size-3 shrink-0" />
            Os nomes dos pacientes ficam só neste computador. O servidor conhece apenas códigos.
          </p>
        </div>

        <div className="hidden border-t border-[#efedf5] px-3 py-3 lg:block">
          <div className="flex items-center gap-3 px-2 pb-3">
            <img src="/fono/voce.webp" alt="" className="size-9 rounded-full object-cover" />
            <span className="min-w-0">
              <span className="block text-[0.86rem] font-semibold text-[#1b1a22]">Você</span>
              <span className="block text-[0.74rem] text-[#6a6779]">Fonoaudióloga</span>
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-medium text-[#6a6779] transition-colors outline-none hover:bg-[#f8f7fc] hover:text-[#1b1a22] focus-visible:ring-2 focus-visible:ring-[#8e7ff0]"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao site
          </a>
        </div>
      </aside>
    </div>
  )
}
