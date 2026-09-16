'use client'

import { useEffect, useState } from 'react'
import { lifeGraph, useApp } from '@/store'
import { patternFor, vibrate } from '@/channels'
import { useSyncChannel } from '@/hooks/useSyncChannel'

const CUE_HOLD_MS = 6000

export function WatchScreen() {
  const { code, devices, connect, available } = useSyncChannel('watch')
  const lastCue = useApp(s => s.lastCue)
  const setLastCue = useApp(s => s.setLastCue)
  const intensity = useApp(s => s.intensity)

  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!lastCue) return
    vibrate(
      patternFor(lastCue.level, lastCue.isFinal),
      { phone: true, earbuds: false, watch: true },
      intensity
    )
    const timer = window.setTimeout(() => setLastCue(null), CUE_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [lastCue, intensity, setLastCue])

  async function handleJoin() {
    if (typed.length !== 4) return
    setBusy(true)
    await connect(typed)
    setBusy(false)
  }

  const node = lastCue ? lifeGraph.nodes[lastCue.targetId] : null
  const text = lastCue?.isFinal
    ? node?.phon
      ? `${node.phon.firstSyllable}…`
      : null
    : (node?.attrs[lastCue?.attr ?? ''] ?? null)

  return (
    <div className="grid min-h-dvh place-items-center bg-black p-4">
      <div className="relative grid aspect-square w-full max-w-[300px] place-items-center overflow-hidden rounded-full border border-line bg-ink p-8 text-center">
        {!available ? (
          <p className="text-xs leading-relaxed text-faint">
            Sem <code className="font-mono">NEXT_PUBLIC_API_URL</code>.
          </p>
        ) : !code ? (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="label-caps">código</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={typed}
              onChange={event => setTyped(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              aria-label="Código da sessão"
              className="tabular w-full rounded-card border border-line bg-surface px-2 py-3 text-center text-xl tracking-[0.3em] outline-none placeholder:text-faint"
            />
            <button
              onClick={handleJoin}
              disabled={busy || typed.length !== 4}
              className="w-full rounded-card border border-fg bg-fg px-3 py-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Parear
            </button>
          </div>
        ) : lastCue && text ? (
          <div className="animate-rise flex flex-col items-center gap-1">
            <span className="label-caps">
              {lastCue.event === 'resolved' ? 'a palavra' : `degrau ${lastCue.level}`}
            </span>
            <p className="voice text-xl leading-tight text-fg">{text}</p>
            {lastCue.edge && <span className="text-[0.6rem] text-faint">{lastCue.edge}</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="voice tabular text-lg tracking-[0.18em] text-dim">{code}</span>
            <span className="label-caps">
              {devices.length > 1 ? 'pareado' : 'esperando o celular'}
            </span>
            <span className="mt-1 text-[0.62rem] text-faint">
              {devices.length} {devices.length === 1 ? 'aparelho' : 'aparelhos'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
