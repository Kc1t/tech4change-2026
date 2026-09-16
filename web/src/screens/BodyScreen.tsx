'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/store'
import { notifyWatch, vibrate, type WatchOutcome } from '@/channels'
import { RowButton, SegmentedControl } from '@/components/Controls'
import { BuzzPicker, DeviceList } from '@/components/DevicePanel'
import { SyncPanel } from '@/components/SyncPanel'
import { HapticWords } from '@/components/HapticWords'
import { BrandMark, NotificationBell, Screen, TopBar } from '@/components/layout'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import type { DiscretionMode } from '@/domain/types'

const WATCH_MESSAGE: Record<WatchOutcome, string> = {
  'sent-worker': 'Enviado pelo service worker — olhe o relógio',
  'sent-page': 'Enviado pela página — olhe o relógio. Instale o app para o caminho mais confiável',
  'channel-off': 'Ligue o relógio na lista acima primeiro',
  unsupported: 'Este navegador não tem notificações. Use o Chrome no Android',
  denied: 'A permissão de notificação foi negada nas configurações do navegador',
  failed: 'O navegador recusou a notificação'
}

const MODES: Array<{ value: DiscretionMode; label: string; hint: string }> = [
  { value: 'discreet', label: 'Discreto', hint: 'só vibra' },
  { value: 'normal', label: 'Normal', hint: 'vibra e mostra' },
  { value: 'home', label: 'Em casa', hint: 'pode falar alto' }
]

export function BodyScreen() {
  const paired = useApp(s => s.paired)
  const channels = useApp(s => s.channels)
  const discretion = useApp(s => s.discretion)
  const intensity = useApp(s => s.intensity)
  const setDiscretion = useApp(s => s.setDiscretion)
  const setIntensity = useApp(s => s.setIntensity)

  const [watchResult, setWatchResult] = useState<string | null>(null)
  const { available: installable, install } = useInstallPrompt()

  const live = paired.filter(device => device.on).length

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
        <p className="label-caps">os aparelhos</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Onde a ajuda chega</h2>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          {live} de {paired.length} ligados. A dica chega em todos no mesmo instante.
        </p>
      </div>

      <DeviceList />

      <div className="mt-2">
        <p className="label-caps">onde vibra</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">O que bate junto com a dica</h2>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Escolha em que aparelho você quer sentir. A vibração marca o tempo, não a palavra.
        </p>
      </div>

      <BuzzPicker />

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

      <div className="flex flex-col gap-2.5">
        <RowButton onClick={() => vibrate('level3', channels, intensity)}>Sentir agora</RowButton>
        <RowButton onClick={testWatch}>
          {watchResult ?? 'Enviar um teste para o relógio'}
        </RowButton>
      </div>

      <div className="mt-2">
        <p className="label-caps mb-2">discrição</p>
        <SegmentedControl value={discretion} options={MODES} onChange={setDiscretion} />
      </div>

      <div className="mt-2">
        <p className="label-caps">a mesma sessão</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">Ligar celular e relógio</h2>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Um código de quatro dígitos põe os dois na mesma conversa. A ponte transmite identificador,
          nível e aresta — nunca a palavra.
        </p>
      </div>

      <SyncPanel />

      <div className="mt-2">
        <p className="label-caps">o relógio da dica</p>
        <h2 className="voice mt-1.5 text-xl leading-tight">A vibração marca o tempo</h2>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Ela abre a janela em que vale a pena tentar e depois bate junto com as sílabas que o fone
          diz — é o mesmo compasso, do aviso até a dica. Quanto mais a palavra trava, mais longo é o
          aviso. Toque para sentir.
        </p>
      </div>

      <HapticWords />

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
