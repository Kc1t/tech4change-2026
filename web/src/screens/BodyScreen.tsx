'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/store'
import { notifyWatch, vibrate, type WatchOutcome } from '@/channels'
import { RowButton, SegmentedControl } from '@/components/Controls'
import { BuzzPicker, DeviceList } from '@/components/DevicePanel'
import { SyncPanel } from '@/components/SyncPanel'
import { HapticWords } from '@/components/HapticWords'
import { BrandMark, NotificationBell, Screen, ScreenHeader, Tabs, TopBar } from '@/components/layout'
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

type Tab = 'devices' | 'session' | 'rhythm'

const TABS = [
  { value: 'devices' as const, label: 'Aparelhos' },
  { value: 'session' as const, label: 'Sessão' },
  { value: 'rhythm' as const, label: 'Ritmo' }
]

const CAPS = 'label-caps mb-2'
const NOTE = 'text-xs leading-relaxed text-dim'

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
  const [tab, setTab] = useState<Tab>('devices')
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
    <Screen>
      <TopBar left={<BrandMark />} right={<NotificationBell />} />
      <ScreenHeader title="Configurações" />
      <Tabs options={TABS} value={tab} onChange={setTab} />

      {tab === 'devices' && (
        <>
          <p className={NOTE}>
            {live} de {paired.length} ligados. A dica chega em todos no mesmo instante.
          </p>

          <DeviceList />

          <div>
            <p className={CAPS}>onde vibra</p>
            <BuzzPicker />
          </div>

          <div>
            <p className={CAPS}>força da vibração</p>
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
            <RowButton onClick={() => vibrate('level3', channels, intensity)}>
              Sentir agora
            </RowButton>
            <RowButton onClick={testWatch}>
              {watchResult ?? 'Enviar um teste para o relógio'}
            </RowButton>
          </div>

          <div>
            <p className={CAPS}>discrição</p>
            <SegmentedControl value={discretion} options={MODES} onChange={setDiscretion} />
          </div>
        </>
      )}

      {tab === 'session' && (
        <>
          <p className={NOTE}>
            Um código de quatro dígitos põe celular e relógio na mesma conversa. A ponte transmite
            identificador, nível e aresta — nunca a palavra.
          </p>

          <SyncPanel />
        </>
      )}

      {tab === 'rhythm' && (
        <>
          <p className={NOTE}>
            A vibração abre a janela em que vale a pena tentar e depois bate junto com as sílabas que
            o fone diz. Toque para sentir.
          </p>

          <HapticWords />
        </>
      )}

      <p className="mt-2 border-l-2 border-line pl-3 text-[0.72rem] leading-relaxed text-faint">
        Esta tela também é o controle de privacidade. O que estiver desligado aqui não é usado, e
        nenhum áudio sai do aparelho até você tocar em Travei.
      </p>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/consent"
          className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(90,70,160,0.04),0_6px_18px_-6px_rgba(90,70,160,0.12)] px-4 text-[14px] font-semibold text-fg"
        >
          Primeiro acesso
          <Chevron />
        </Link>
        <Link
          href="/clinical"
          className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(90,70,160,0.04),0_6px_18px_-6px_rgba(90,70,160,0.12)] px-4 text-[14px] font-semibold text-fg"
        >
          Painel do fonoaudiólogo
          <Chevron />
        </Link>
        {installable && (
          <button
            onClick={() => void install()}
            className="flex min-h-tap items-center justify-between rounded-[18px] bg-surface shadow-[0_1px_2px_rgba(90,70,160,0.04),0_6px_18px_-6px_rgba(90,70,160,0.12)] px-4 text-left text-[14px] font-semibold text-brand"
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
