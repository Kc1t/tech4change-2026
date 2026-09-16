'use client'

import { useState } from 'react'
import { useSyncChannel } from '@/hooks/useSyncChannel'
import type { Device, DeviceKind } from '@/sync/client'

const KIND_LABEL: Record<DeviceKind, string> = {
  phone: 'celular',
  watch: 'relógio',
  earbuds: 'fone',
  desktop: 'computador'
}

const KIND_GLYPH: Record<DeviceKind, string> = {
  phone: 'M8 3h8v18H8zM11 18h2',
  watch: 'M9 7h6v10H9zM10 3h4v4h-4zM10 17h4v4h-4z',
  earbuds: 'M7 10a3 3 0 016 0v7a3 3 0 01-6 0zM17 6v11',
  desktop: 'M3 5h18v11H3zM9 20h6M12 16v4'
}

export function SyncPanel() {
  const { code, deviceId, devices, open, connect, close, available } = useSyncChannel()
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpen() {
    setBusy(true)
    setError(null)
    const created = await open()
    if (!created) setError('Não foi possível abrir a sessão. A API está no ar?')
    setBusy(false)
  }

  async function handleJoin() {
    if (typed.length !== 4) return
    setBusy(true)
    setError(null)
    const joined = await connect(typed)
    if (!joined) setError('Código não encontrado.')
    else setTyped('')
    setBusy(false)
  }

  if (!available) {
    return (
      <p className="rounded-card border border-dashed border-line p-4 text-xs leading-relaxed text-faint">
        Defina <code className="font-mono">NEXT_PUBLIC_API_URL</code> para ligar os aparelhos entre si.
      </p>
    )
  }

  if (!code) {
    return (
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleOpen}
          disabled={busy}
          className="rounded-card border border-fg bg-fg px-4 py-4 font-semibold text-ink disabled:opacity-50"
        >
          Abrir uma sessão
        </button>

        <div className="flex gap-2">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={typed}
            onChange={event => setTyped(event.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            aria-label="Código da sessão"
            className="tabular w-full min-w-0 rounded-card border border-line bg-surface px-4 py-4 text-center text-xl tracking-[0.3em] outline-none placeholder:text-faint"
          />
          <button
            onClick={handleJoin}
            disabled={busy || typed.length !== 4}
            className="shrink-0 rounded-card border border-line bg-surface px-5 font-semibold disabled:opacity-40"
          >
            Entrar
          </button>
        </div>

        {error && <p className="text-xs text-mastery-low">{error}</p>}

        <p className="text-[0.68rem] leading-relaxed text-faint">
          Abra a sessão no celular e digite o código no relógio. A ponte transmite identificador,
          nível e aresta — nunca a palavra.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-4">
        <div className="min-w-0 flex-1">
          <span className="label-caps">código da sessão</span>
          <p className="voice tabular mt-0.5 text-2xl leading-none tracking-[0.18em]">{code}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-mastery-high">
          <i className="block size-1.5 animate-breathe rounded-full bg-mastery-high" />
          no ar
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {devices.map(device => (
          <DeviceRow key={device.id} device={device} isSelf={device.id === deviceId} />
        ))}
        {devices.length < 2 && (
          <p className="rounded-card border border-dashed border-line px-4 py-3 text-[0.72rem] leading-relaxed text-faint">
            Esperando o segundo aparelho. Abra <code className="font-mono">/#/watch</code> em outro
            aparelho e digite {code}.
          </p>
        )}
      </div>

      <button
        onClick={close}
        className="rounded-card border border-line bg-surface px-4 py-4 text-xs font-semibold"
      >
        Encerrar a sessão
      </button>
    </div>
  )
}

function DeviceRow({ device, isSelf }: { device: Device; isSelf: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-5 shrink-0 fill-none stroke-current stroke-[1.6] text-dim"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={KIND_GLYPH[device.kind]} />
      </svg>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">
          {device.name}
          {isSelf && <span className="ml-2 text-[0.66rem] font-medium text-faint">este aqui</span>}
        </h3>
        <span className="label-caps">{KIND_LABEL[device.kind]}</span>
      </div>
      <i className="block size-1.5 rounded-full bg-mastery-high" aria-label="conectado" />
    </div>
  )
}
