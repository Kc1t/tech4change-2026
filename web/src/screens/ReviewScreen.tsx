'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { lifeGraph, seeded, useApp } from '@/store'
import { vibrate } from '@/channels'
import type { NodeId } from '@/domain/types'
import { Screen } from '@/components/layout'

const KIND_LABEL: Record<string, string> = {
  person: 'pessoa',
  place: 'lugar',
  object: 'objeto',
  event: 'acontecimento',
  animal: 'animal'
}

export function ReviewScreen() {
  const channels = useApp(s => s.channels)
  const intensity = useApp(s => s.intensity)
  const confirmations = useApp(s => s.confirmations)
  const confirm = useApp(s => s.confirm)
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    startedAt.current = Date.now()
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.current) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const suggestions = useMemo(() => {
    return Object.values(lifeGraph.nodes)
      .filter(node => node.id !== lifeGraph.owner)
      .map(node => {
        const edges = lifeGraph.edges.filter(e => e.from === node.id || e.to === node.id)
        const direct = edges.find(e => e.from === lifeGraph.owner || e.to === lifeGraph.owner)
        const evidence = (direct ?? edges[0])?.provenance[0]
        const weight = Math.max(0, ...edges.map(e => e.weight))
        return {
          id: node.id,
          label: node.label,
          kind: KIND_LABEL[node.kind] ?? node.kind,
          aliases: node.aliases ?? [],
          detail: evidence?.detail ?? 'sem evidência registrada',
          shared: !direct,
          weight
        }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [])

  const done = suggestions.filter(s => confirmations[s.id]).length

  function handleConfirm(id: NodeId) {
    vibrate('confirm', channels, intensity)
    confirm(id)
  }

  return (
    <Screen className="gap-4">
      <div>
        <p className="label-caps">primeiro acesso · revisão</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Confira o que encontramos</h2>
        <p className="mt-1 text-xs text-dim">
          {seeded
            ? 'Estes nós vieram das três respostas que você deu. Confirme ou corrija, uma vez só.'
            : 'Ninguém escreve nada do zero. A família confirma ou corrige, uma vez só.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-line">
          <i
            className="block h-full rounded-sm bg-brand transition-all"
            style={{ width: `${(done / suggestions.length) * 100}%` }}
          />
        </div>
        <span className="tabular text-[0.72rem] text-faint">
          {done} de {suggestions.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {suggestions.map(suggestion => {
          const confirmed = Boolean(confirmations[suggestion.id])
          return (
            <div
              key={suggestion.id}
              className={[
                'flex items-center gap-3 rounded-card border bg-surface p-4',
                confirmed ? 'border-mastery-high' : 'border-line'
              ].join(' ')}
            >
              <span className="voice grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-lg text-dim">
                {suggestion.label[0]}
              </span>
              <span className="min-w-0 flex-1">
                <h3 className="text-base font-semibold">
                  {suggestion.label} · {suggestion.kind}
                </h3>
                <p className="mt-0.5 text-[0.7rem] leading-snug text-faint">
                  {suggestion.shared ? `${suggestion.detail} (evidência indireta)` : suggestion.detail}
                  {suggestion.aliases.length > 0 && ` · também chamada de ${suggestion.aliases.join(', ')}`}
                </p>
              </span>
              <button
                onClick={() => handleConfirm(suggestion.id)}
                disabled={confirmed}
                className={[
                  'rounded-full border px-3.5 py-2.5 text-[0.74rem] font-semibold',
                  confirmed ? 'border-mastery-high bg-mastery-high text-ink' : 'border-line text-fg'
                ].join(' ')}
              >
                {confirmed ? 'Confirmado' : 'Confirmar'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="tabular text-[0.72rem] text-faint">tempo nesta tela: {elapsed}s</p>

      <p className="text-[0.68rem] leading-relaxed text-faint">
        Produtos parecidos dependem de a família preencher formulário toda semana. É por isso que são
        abandonados. Aqui a IA propõe e a confirmação acontece uma vez.
      </p>

      <p className="rounded-card border border-dashed border-line p-3 text-[0.68rem] leading-relaxed text-faint">
        {seeded
          ? 'O que você digitou não passou pelo nosso servidor. Veio no fragmento da URL, que por especificação nunca é enviado — e virou grafo aqui dentro. Abra o DevTools e confira.'
          : 'Esta tela é a única que sabe que o rosto agrupado como “Pessoa 1” é a Letícia. Essa ligação fica no aparelho e não é enviada para lugar nenhum — é justamente o dado que o servidor nunca pode ver.'}
      </p>
    </Screen>
  )
}
