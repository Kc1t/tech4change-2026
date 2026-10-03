import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { BuddyMark } from './buddy-mark'
import { PATIENT, SUGGESTIONS } from './data'
import { formatLevel } from './stats'

const TONE_DOT: Record<string, string> = { work: '#d99a52', attention: '#d0705a', progress: '#4f9c74', calm: '#5b93c2' }
const NOTABLE_DROP = 0.3
const RULE_LADDERS = 3

function toggle(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

type AiSummaryProps = { levelNow: number | null; levelBefore: number | null; blocks: number }

export function AiSummary({ levelNow, levelBefore, blocks }: AiSummaryProps) {
  const [noted, setNoted] = useState<Set<string>>(() => new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const visible = SUGGESTIONS.filter(item => !dismissed.has(item.id))
  const drop = levelBefore != null && levelNow != null ? levelBefore - levelNow : 0

  return (
    <section className="cd-panel cd-ai">
      <header className="cd-ai-head">
        <BuddyMark size={38} />
        <div>
          <h2>O resumo do eilo</h2>
          <p>Lido dos eventos da semana</p>
        </div>
      </header>
      <p className="cd-ai-brief">
        Nesta semana, {PATIENT.name} travou {blocks} vezes fora da sessão e precisou, em média, de {formatLevel(levelNow)} pistas até a palavra sair.
        {drop >= NOTABLE_DROP && ` É menos que na semana anterior (${formatLevel(levelBefore)}): a palavra está voltando mais cedo.`}
      </p>

      <h3 className="cd-ai-sub">Para levar à sessão</h3>
      {visible.length === 0 ? (
        <p className="cd-ai-empty">Nada pendente. As sugestões dispensadas voltam se os dados mudarem.</p>
      ) : (
        <ul className="cd-ai-list">
          {visible.map(item => {
            const isNoted = noted.has(item.id)
            return (
              <li key={item.id}>
                <p><i style={{ background: TONE_DOT[item.tone] }} />{item.text}</p>
                <div className="cd-ai-actions">
                  <button type="button" className={isNoted ? 'noted' : undefined} onClick={() => setNoted(previous => toggle(previous, item.id))}>
                    {isNoted && <Check />}
                    {isNoted ? 'Anotado' : 'Anotar para a sessão'}
                  </button>
                  <button type="button" className="ghost" onClick={() => setDismissed(previous => new Set(previous).add(item.id))}>Dispensar</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="cd-ai-foot">
        <ShieldCheck />
        <span>{Math.max(0, blocks - RULE_LADDERS)} de {blocks} escadas desta semana foram ordenadas pela IA. Ela recebe só códigos, nunca os nomes. Sugestão, não diagnóstico.</span>
      </p>
    </section>
  )
}
