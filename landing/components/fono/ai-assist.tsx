'use client'

import { useState, type ReactNode } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import type { AuditEvent } from './api'
import type { Kpis, PeriodStats, Suggestion } from './derive'
import { formatLevel } from './format'

export function BuddyMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full shadow-[0_6px_16px_-6px_rgba(107,95,168,0.55)] ${className}`}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 24% 18%, rgba(255,255,255,0.8) 0 6%, transparent 15%), radial-gradient(circle at 50% 108%, #a9dcff 0 30%, transparent 58%), radial-gradient(circle at 76% 30%, #efb6ec 0 18%, transparent 46%), radial-gradient(circle at 44% 42%, #8b7bee, #9d8cf3 45%, #b9a3f7 82%)'
      }}
    >
      <span className="absolute inset-x-0 top-[33%] flex h-[24%] justify-center gap-[18%]">
        <i className="v3-orb-eye block h-full w-[11%] min-w-[3px] rounded-full bg-white" />
        <i className="v3-orb-eye block h-full w-[11%] min-w-[3px] rounded-full bg-white" />
      </span>
    </span>
  )
}

function Card({
  title,
  note,
  action,
  children
}: {
  title: ReactNode
  note?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#e6e3ef] bg-white">
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[0.98rem] font-semibold tracking-[-0.015em] text-[#1b1a22]">
            {title}
          </h2>
          {note && <p className="mt-0.5 text-[0.8rem] leading-relaxed text-[#6a6779]">{note}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

const TONE_DOT: Record<Suggestion['tone'], string> = {
  work: 'bg-[#d99a52]',
  attention: 'bg-[#d0705a]',
  progress: 'bg-[#4f9c74]',
  calm: 'bg-[#5b93c2]'
}

function briefing(name: string, kpis: Kpis, week: PeriodStats) {
  if (week.blocks === 0) return `${name} ainda não travou nesta semana. Assim que acontecer, eu conto aqui.`
  const parts = [`Nesta semana, ${name} travou ${week.blocks} ${week.blocks === 1 ? 'vez' : 'vezes'} fora da sessão`]
  if (kpis.levelNow != null) parts.push(`e precisou, em média, de ${formatLevel(kpis.levelNow)} pistas até a palavra sair`)
  let text = parts.join(' ') + '.'
  if (kpis.levelNow != null && kpis.levelBefore != null) {
    const delta = kpis.levelBefore - kpis.levelNow
    if (delta >= 0.3) text += ` É menos que na semana anterior (${formatLevel(kpis.levelBefore)}): a palavra está voltando mais cedo.`
    else if (delta <= -0.3) text += ` Subiu em relação à semana anterior (${formatLevel(kpis.levelBefore)}): vale olhar com calma.`
    else text += ' Ficou parecido com a semana anterior.'
  }
  return text
}

export function AiAssistant({
  name,
  kpis,
  week,
  suggestions,
  events
}: {
  name: string
  kpis: Kpis
  week: PeriodStats
  suggestions: Suggestion[]
  events: AuditEvent[]
}) {
  const [noted, setNoted] = useState<Set<string>>(() => new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const visible = suggestions.filter(item => !dismissed.has(item.id))
  const ladders = events.filter(event => event.event === 'block')
  const byModel = ladders.filter(event => event.origin !== 'deterministic').length

  return (
    <section className="min-w-0 rounded-2xl border border-[#e6e3ef] bg-white">
      <header className="flex items-center gap-3 px-5 pt-5">
        <BuddyMark size={34} />
        <div className="min-w-0">
          <h2 className="text-[0.98rem] font-semibold tracking-[-0.015em]">O resumo do eilo</h2>
          <p className="text-[0.76rem] text-[#8d8a9c]">Lido dos eventos da semana</p>
        </div>
      </header>

      <p className="px-5 pt-4 text-[0.92rem] leading-relaxed text-[#3a3846]">{briefing(name, kpis, week)}</p>

      <h3 className="mt-5 border-t border-[#efedf5] px-5 pt-4 text-[0.8rem] font-semibold text-[#1b1a22]">
        Para levar à sessão
      </h3>
      {visible.length === 0 ? (
        <p className="px-5 pt-2 pb-5 text-[0.84rem] leading-relaxed text-[#6a6779]">
          {suggestions.length === 0
            ? 'Ainda pouco dado para sugerir algo. As ideias aparecem conforme a semana acontece.'
            : 'Nada pendente. As sugestões dispensadas voltam se os dados mudarem.'}
        </p>
      ) : (
        <ul className="px-5 pt-1 pb-2">
          {visible.map(item => {
            const isNoted = noted.has(item.id)
            return (
              <li key={item.id} className="border-b border-[#f3f1f8] py-3 last:border-b-0">
                <p className="flex gap-2.5 text-[0.86rem] leading-snug text-[#3a3846]">
                  <span className={`mt-[0.45rem] size-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone]}`} />
                  {item.text}
                </p>
                <div className="mt-2 flex gap-4 pl-4 text-[0.78rem] font-medium">
                  <button
                    type="button"
                    aria-pressed={isNoted}
                    onClick={() =>
                      setNoted(previous => {
                        const next = new Set(previous)
                        if (next.has(item.id)) next.delete(item.id)
                        else next.add(item.id)
                        return next
                      })
                    }
                    className={`inline-flex items-center gap-1 transition-colors ${
                      isNoted ? 'text-[#2f7a57]' : 'text-[#6b5fa8] hover:text-[#433d56]'
                    }`}
                  >
                    {isNoted && <Check className="size-3.5" />}
                    {isNoted ? 'Anotado' : 'Anotar para a sessão'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissed(previous => new Set(previous).add(item.id))}
                    className="text-[#8d8a9c] transition-colors hover:text-[#3a3846]"
                  >
                    Dispensar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="flex items-start gap-2 border-t border-[#efedf5] px-5 py-3.5 text-[0.74rem] leading-relaxed text-[#8d8a9c]">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {ladders.length > 0 && `${byModel} de ${ladders.length} escadas desta semana foram ordenadas pela IA. `}
          Ela recebe só códigos, nunca os nomes. Sugestão, não diagnóstico.
        </span>
      </p>
    </section>
  )
}

function Toggle({
  label,
  hint,
  on,
  onChange
}: {
  label: string
  hint: string
  on: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#faf9fd]">
      <span className="min-w-0">
        <span className="block text-[0.86rem] font-semibold text-[#1b1a22]">{label}</span>
        <span className="mt-0.5 block text-[0.76rem] leading-snug text-[#6a6779]">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8e7ff0] ${on ? 'bg-[#8e7ff0]' : 'bg-[#dcd9e6]'}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

const PATIENCE = [
  { id: 'calm', label: 'Com calma', seconds: '3 s' },
  { id: 'middle', label: 'No meio', seconds: '2 s' },
  { id: 'quick', label: 'Mais rápido', seconds: '1,3 s' }
] as const

export function AiControls() {
  const [ranking, setRanking] = useState(true)
  const [sound, setSound] = useState(true)
  const [closer, setCloser] = useState(false)
  const [patience, setPatience] = useState<(typeof PATIENCE)[number]['id']>('middle')

  return (
    <Card
      title="Você no controle da IA"
      note="O que o eilo pode fazer com este paciente."
    >
      <div className="flex flex-col px-3">
        <Toggle
          label="Ordenar as pistas com IA"
          hint="Desligado, o app usa só a escada pronta, montada no aparelho."
          on={ranking}
          onChange={setRanking}
        />
        <Toggle
          label="Dar o começo do som no fim"
          hint="O último degrau, “Le…”. Desligue se quiser treinar a busca sem ele."
          on={sound}
          onChange={setSound}
        />
        <Toggle
          label="Começar mais perto nas difíceis"
          hint="Palavras que pedem a escada inteira já começam na pista de lugar."
          on={closer}
          onChange={setCloser}
        />
      </div>
      <div className="px-5 pt-2 pb-4">
        <p className="text-[0.86rem] font-semibold text-[#1b1a22]">Quanto tempo esperar a pausa</p>
        <div role="radiogroup" aria-label="Tempo de espera" className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-[#f6f5fb] p-1">
          {PATIENCE.map(item => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={patience === item.id}
              onClick={() => setPatience(item.id)}
              className={`rounded-lg px-2 py-1.5 text-center text-[0.74rem] font-semibold transition-colors ${
                patience === item.id ? 'bg-white text-[#1b1a22] shadow-sm' : 'text-[#6a6779] hover:text-[#1b1a22]'
              }`}
            >
              {item.label}
              <span className="block text-[0.66rem] font-medium text-[#8d8a9c]">{item.seconds}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.72rem] leading-relaxed text-[#8d8a9c]">
          Prévia: estes ajustes ainda não chegam ao celular do paciente.
        </p>
      </div>
    </Card>
  )
}
