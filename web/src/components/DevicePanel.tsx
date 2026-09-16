'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/store'
import { vibrate } from '@/channels'
import { Switch } from '@/components/Controls'
import {
  KIND_GLYPH,
  KIND_LABEL,
  buzzTargets,
  roleOf,
  undiscovered,
  type PairedDevice
} from '@/domain/devices'

const CARD =
  'rounded-card bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)]'

const SCAN_MS = 1400

function DeviceGlyph({ device, className }: { device: PairedDevice; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={KIND_GLYPH[device.kind]} />
    </svg>
  )
}

function Battery({ level }: { level: number }) {
  return (
    <span className="tabular flex items-center gap-1 text-[0.66rem] font-semibold text-faint">
      <svg viewBox="0 0 24 12" aria-hidden="true" className="h-2.5 w-5">
        <rect
          x="0.8"
          y="0.8"
          width="19"
          height="10.4"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="2.6"
          y="2.6"
          width={Math.max(2, 15.4 * (level / 100))}
          height="6.8"
          rx="1.6"
          fill="currentColor"
        />
        <path d="M21.6 4.2v3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {level}%
    </span>
  )
}

export function BuzzPicker() {
  const paired = useApp(s => s.paired)
  const channels = useApp(s => s.channels)
  const intensity = useApp(s => s.intensity)
  const toggleBuzz = useApp(s => s.toggleBuzz)

  const options = buzzTargets(paired)
  const chosen = options.filter(device => device.buzz)

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {options.map(device => (
          <button
            key={device.id}
            aria-pressed={device.buzz}
            onClick={() => {
              toggleBuzz(device.id)
              if (!device.buzz) vibrate('confirm', { ...channels, phone: true }, intensity)
            }}
            className={[
              'flex min-h-tap items-center gap-2 rounded-full px-4 text-[0.82rem] font-semibold transition-colors',
              device.buzz ? 'bg-fg text-ink' : `${CARD} text-dim`
            ].join(' ')}
          >
            <DeviceGlyph device={device} className="size-[18px] shrink-0" />
            {device.name}
          </button>
        ))}
      </div>

      {chosen.length === 0 ? (
        <p className="text-[0.72rem] leading-relaxed text-mastery-low">
          Nenhum aparelho vibra agora. A dica vai chegar só por voz ou pela tela.
        </p>
      ) : (
        <p className="text-[0.72rem] leading-relaxed text-faint">
          A vibração marca o tempo em {chosen.map(device => device.name.toLowerCase()).join(' e ')}.
        </p>
      )}
    </div>
  )
}

export function DeviceList() {
  const paired = useApp(s => s.paired)
  const toggleDevice = useApp(s => s.toggleDevice)
  const unpairDevice = useApp(s => s.unpairDevice)
  const [pairing, setPairing] = useState(false)

  return (
    <div className="flex flex-col gap-2.5">
      {paired.map(device => (
        <div key={device.id} className={`flex items-center gap-3 ${CARD} p-4`}>
          <span
            className={[
              'flex size-11 shrink-0 items-center justify-center rounded-full',
              device.on ? 'bg-brand-soft text-fg' : 'bg-surface-2 text-faint'
            ].join(' ')}
          >
            <DeviceGlyph device={device} className="size-[22px]" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className={`truncate text-[0.95rem] font-semibold ${device.on ? '' : 'text-faint'}`}>
              {device.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="label-caps">{KIND_LABEL[device.kind]}</span>
              {device.battery !== null && <Battery level={device.battery} />}
              {device.channel === null && (
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-faint">
                  simulado
                </span>
              )}
            </div>
            <p className="mt-1 text-[0.72rem] text-dim">{roleOf(device)}</p>
          </div>

          {device.channel === null && (
            <button
              onClick={() => unpairDevice(device.id)}
              aria-label={`Remover ${device.name}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-faint"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
              </svg>
            </button>
          )}

          <Switch
            checked={device.on}
            label={device.name}
            disabled={device.id === 'phone'}
            onChange={() => toggleDevice(device.id)}
          />
        </div>
      ))}

      <button
        onClick={() => setPairing(true)}
        className="flex min-h-tap w-full items-center justify-center gap-2 rounded-card border border-dashed border-line text-[0.82rem] font-semibold text-brand"
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M10 4.5v11M4.5 10h11" />
        </svg>
        Adicionar aparelho
      </button>

      {pairing && <PairSheet onClose={() => setPairing(false)} />}
    </div>
  )
}

function PairSheet({ onClose }: { onClose: () => void }) {
  const paired = useApp(s => s.paired)
  const pairDevice = useApp(s => s.pairDevice)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setScanning(false), SCAN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const found = undiscovered(paired)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-fg/35 backdrop-blur-[2px]"
      />

      <div className="animate-rise relative w-full max-w-[520px] rounded-t-[28px] bg-ink px-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-3">
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line" />

        <p className="label-caps">parear</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Aparelhos por perto</h2>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Deixe o aparelho perto do celular e ligado. Nesta versão a busca é simulada.
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          {scanning && (
            <div className={`flex items-center gap-3 ${CARD} p-4`}>
              <span className="size-2.5 shrink-0 animate-breathe rounded-full bg-brand" />
              <p className="text-[0.82rem] font-semibold text-dim">Procurando aparelhos…</p>
            </div>
          )}

          {!scanning &&
            found.map(device => (
              <button
                key={device.id}
                onClick={() => {
                  pairDevice(device.id)
                  onClose()
                }}
                className={`flex items-center gap-3 ${CARD} p-4 text-left`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-dim">
                  <DeviceGlyph device={device} className="size-[22px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[0.95rem] font-semibold">{device.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="label-caps">{KIND_LABEL[device.kind]}</span>
                    {device.battery !== null && <Battery level={device.battery} />}
                  </div>
                </div>
                <span className="shrink-0 text-[0.78rem] font-semibold text-brand">Parear</span>
              </button>
            ))}

          {!scanning && found.length === 0 && (
            <p className="rounded-card border border-dashed border-line px-4 py-5 text-center text-[0.76rem] leading-relaxed text-faint">
              Nada novo por perto. Todos os aparelhos conhecidos já estão na lista.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className={`mt-3 min-h-tap w-full ${CARD} text-[0.82rem] font-semibold text-dim`}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
