import { useState } from 'react'
import { useApp } from '@/store'
import { notifyWatch, vibrate } from '@/channels'
import { RowButton, SegmentedControl, Switch } from '@/components/Controls'
import type { ChannelState, DiscretionMode } from '@/domain/types'

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

  async function testWatch() {
    const delivered = await notifyWatch(
      'Teste',
      'Se vibrou no pulso, o espelhamento funciona.',
      channels
    )
    setWatchResult(
      delivered
        ? 'Enviado — olhe o relógio'
        : channels.watch
          ? 'Este navegador bloqueou a notificação'
          : 'Ligue o relógio acima primeiro'
    )
  }

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">os canais</p>
        <h2 className="voice mt-2 text-xl leading-tight">Como a ajuda chega até você</h2>
        <p className="mt-1 text-xs text-dim">
          Nenhum canal é confiável sozinho. Ligue os que funcionam para você.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {DEVICES.map(device => (
          <div
            key={device.key}
            className="flex items-start gap-3 rounded-card border border-line bg-surface p-4"
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

        <div className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 opacity-55">
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
    </section>
  )
}
