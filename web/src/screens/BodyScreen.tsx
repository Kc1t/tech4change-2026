'use client'

import { useState } from 'react'
import { useApp } from '@/store'
import { notifyWatch, vibrate, type WatchOutcome } from '@/channels'

const WATCH_MESSAGE: Record<WatchOutcome, string> = {
  'sent-worker': 'Enviado pelo service worker — olhe o relógio',
  'sent-page': 'Enviado pela página — olhe o relógio. Instale o app para o caminho mais confiável',
  'channel-off': 'Ligue o relógio acima primeiro',
  unsupported: 'Este navegador não tem notificações. Use o Chrome no Android',
  denied: 'A permissão de notificação foi negada nas configurações do navegador',
  failed: 'O navegador recusou a notificação'
}
import { RowButton, SegmentedControl, Switch } from '@/components/Controls'
import { SyncPanel } from '@/components/SyncPanel'
import { HapticWords } from '@/components/HapticWords'
import type { ChannelState, DiscretionMode } from '@/domain/types'
import { BrandMark, NotificationBell, Screen, TopBar } from '@/components/layout'
import Link from 'next/link'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

const DEVICES: Array<{
  key: keyof ChannelState
  name: string
  description: string
  role: string
}> = [
  {
    key: 'phone',
    name: 'Celular',
    description: 'Vibra no ritmo da dica e mostra o texto se você quiser olhar.',
    role: 'tempo · sincronia'
  },
  {
    key: 'earbuds',
    name: 'Fone de ouvido',
    description: 'A dica é dita baixinho só para você. Ninguém na mesa ouve.',
    role: 'a dica · som'
  },
  {
    key: 'watch',
    name: 'Relógio',
    description: 'Vibra no pulso e mostra o degrau, para olhar de relance.',
    role: 'discrição · relance'
  }
]

const MODES: Array<{ value: DiscretionMode; label: string; hint: string }> = [
  { value: 'discreet', label: 'Discreto', hint: 'só vibra' },
  { value: 'normal', label: 'Normal', hint: 'vibra e mostra' },
  { value: 'home', label: 'Em casa', hint: 'pode falar alto' }
]

export function BodyScreen() {
  const channels = useApp(s => s.channels)
  const discretion = useApp(s => s.discretion)
  const intensity = useApp(s => s.intensity)
  const toggleChannel = useApp(s => s.toggleChannel)
  const setDiscretion = useApp(s => s.setDiscretion)
  const setIntensity = useApp(s => s.setIntensity)

  const [watchResult, setWatchResult] = useState<string | null>(null)
  const { available: installable, install } = useInstallPrompt()

  async function testWatch() {
    const outcome = await notifyWatch(
      'Degrau 1',
      'Se vibrou no pulso, o espelhamento funciona.',
      channels
    )
    setWatchResult(WATCH_MESSAGE[outcome])
  }

  return (
    <Screen className="gap-4">
      <TopBar left={<BrandMark />} right={<NotificationBell />} />
      <div>
        <p className="label-caps">aparelhos conectados</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Os seus aparelhos, na mesma sessão</h2>
        <p className="mt-1 text-xs text-dim">
          Um código de quatro dígitos liga celular e relógio. A dica chega nos dois ao mesmo tempo.
        </p>
      </div>

      <SyncPanel />

      <div className="mt-2">
        <p className="label-caps">os canais</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Como a ajuda chega até você</h2>
        <p className="mt-1 text-xs text-dim">
          Nenhum canal é confiável sozinho. Ligue os que funcionam para você.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {DEVICES.map(device => (
          <div
            key={device.key}
            className="flex items-start gap-3 rounded-card bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] p-4"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold">{device.name}</h3>
              <p className="mt-0.5 text-[0.74rem] leading-relaxed text-dim">{device.description}</p>
              <span className="label-caps mt-2 block">{device.role}</span>
            </div>
            <Switch
              checked={channels[device.key]}
              label={device.name}
              onChange={() => {
                toggleChannel(device.key)
                vibrate('confirm', { ...channels, phone: true }, intensity)
              }}
            />
          </div>
        ))}

        <div className="flex items-start gap-3 rounded-card bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] p-4 opacity-55">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">
              Anel{' '}
              <span className="ml-1 rounded border border-line px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-faint">
                futuro
              </span>
            </h3>
            <p className="mt-0.5 text-[0.74rem] leading-relaxed text-dim">
              Quase nenhum anel inteligente tem motor de vibração hoje.
            </p>
            <span className="label-caps mt-2 block">não disponível</span>
          </div>
          <Switch checked={false} label="Anel" disabled onChange={() => {}} />
        </div>
      </div>

      <div>
        <p className="label-caps mb-2">discrição</p>
        <SegmentedControl value={discretion} options={MODES} onChange={setDiscretion} />
      </div>

      <div>
        <p className="label-caps mb-2">força da vibração</p>
        <input
          type="range"
          min={1}
          max={5}
          value={intensity}
          aria-label="Força da vibração"
          onChange={event => setIntensity(Number(event.target.value))}
          onMouseUp={() => vibrate('level2', channels, intensity)}
          onTouchEnd={() => vibrate('level2', channels, intensity)}
          className="w-full accent-accent"
        />
      </div>

      <div className="mt-2">
        <p className="label-caps">o relógio da dica</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">A vibração marca o tempo, não a palavra</h2>
        <p className="mt-1 text-xs text-dim">
          Ela abre a janela em que vale a pena tentar e depois bate junto com as sílabas que o fone
          diz — é o mesmo compasso, do aviso até a dica. Quanto mais a palavra trava, mais longo é o
          aviso. Toque para sentir.
        </p>
      </div>

      <HapticWords />

      <div className="flex flex-col gap-2.5">
        <RowButton onClick={() => vibrate('level3', channels, intensity)}>Sentir agora</RowButton>
        <RowButton onClick={testWatch}>
          {watchResult ?? 'Enviar um teste para o relógio'}
        </RowButton>
      </div>

      <p className="border-l-2 border-line pl-3 text-[0.72rem] leading-relaxed text-faint">
        Esta tela também é o controle de privacidade. O que estiver desligado aqui não é usado, e
        nenhum áudio sai do aparelho até você tocar em Travei.
      </p>

      <div className="mt-2">
        <p className="label-caps">o resto do aplicativo</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Onde ficam as outras telas</h2>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/consent"
          className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] px-4 text-[14px] font-semibold text-fg"
        >
          Primeiro acesso
          <Chevron />
        </Link>
        <Link
          href="/clinical"
          className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] px-4 text-[14px] font-semibold text-fg"
        >
          Painel do fonoaudiólogo
          <Chevron />
        </Link>
        {installable && (
          <button
            onClick={() => void install()}
            className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(22,22,22,0.04),0_6px_18px_-6px_rgba(22,22,22,0.12)] px-4 text-left text-[14px] font-semibold text-brand"
          >
            Instalar no celular
            <Chevron />
          </button>
        )}
      </div>
    </Screen>
  )
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="size-4 shrink-0 text-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
    </svg>
  )
}
