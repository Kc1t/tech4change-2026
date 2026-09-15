import { useState } from 'react'
import { lifeGraph, useApp } from '@/store'
import { notifyWatch, patternFor, speak, unlockAudio, vibrate } from '@/channels'
import { strings } from '@/data/strings'
import { ListeningBadge } from '@/components/ListeningBadge'
import { Step } from '@/components/Step'

export function MomentScreen() {
  const scene = useApp(s => s.scene())
  const ladder = useApp(s => s.ladder)
  const level = useApp(s => s.level)
  const open = useApp(s => s.open)
  const channels = useApp(s => s.channels)
  const discretion = useApp(s => s.discretion)
  const intensity = useApp(s => s.intensity)
  const start = useApp(s => s.start)
  const advance = useApp(s => s.advance)
  const succeed = useApp(s => s.succeed)
  const nextScene = useApp(s => s.nextScene)

  const [resolvedAt, setResolvedAt] = useState<number | null>(null)
  const target = lifeGraph.nodes[scene.targetId]!
  const visible = ladder.slice(0, level)
  const atLastStep = level >= ladder.length

  function emit(index: number) {
    const step = ladder[index]
    if (!step) return
    vibrate(patternFor(step.level, step.isFinal), channels, intensity)
    speak(step.text.replace('…', ''), channels, discretion)
    void notifyWatch(`Degrau ${step.level}`, step.text, channels)
  }

  function handleStart() {
    unlockAudio()
    vibrate('confirm', channels, intensity)
    start()
    requestAnimationFrame(() => emit(useApp.getState().level - 1))
  }

  function handleAdvance() {
    advance()
    requestAnimationFrame(() => emit(useApp.getState().level - 1))
  }

  function handleSuccess() {
    vibrate('success', channels, intensity)
    speak(target.label, channels, discretion)
    void notifyWatch(target.label, 'Você chegou lá.', channels)
    setResolvedAt(succeed())
  }

  function handleNext() {
    setResolvedAt(null)
    nextScene()
  }

  return (
    <section className="flex flex-col gap-4 p-5">
      <ListeningBadge />

      <div className="flex flex-col gap-3">
        <p className="voice rounded-card rounded-bl-[4px] bg-surface-2 px-4 py-3 text-lg leading-snug">
          <span className="label-caps mb-1 block">{scene.speaker}</span>
          {scene.prompt}
        </p>
        <p className="voice rounded-card rounded-bl-[4px] border border-line-soft bg-surface px-4 py-3 text-lg leading-snug">
          <span className="label-caps mb-1 block">Helena</span>
          {scene.attempt}
        </p>
      </div>

      {!open && resolvedAt === null && (
        <button
          onClick={handleStart}
          className="w-full rounded-panel bg-accent px-5 py-6 text-xl font-bold text-accent-ink shadow-soft active:scale-[0.98]"
        >
          {strings.app.stuck}
          <span className="mt-1 block text-xs font-medium opacity-75">
            {strings.app.stuckHint}
          </span>
        </button>
      )}

      {open && (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((step, i) => (
              <Step key={step.level} step={step} dimmed={i < visible.length - 1} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdvance}
              disabled={atLastStep}
              className="rounded-card border border-line bg-surface px-3 py-4 font-semibold disabled:opacity-40"
            >
              {strings.app.notYet}
            </button>
            <button
              onClick={handleSuccess}
              className="rounded-card border border-fg bg-fg px-3 py-4 font-semibold text-ink"
            >
              {strings.app.gotIt}
            </button>
          </div>
        </>
      )}

      {resolvedAt !== null && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="voice animate-reveal text-2xl leading-none text-accent">{target.label}</p>
            <p className="mt-2 text-xs text-dim">
              Quem disse a palavra foi ela. Em {resolvedAt}{' '}
              {resolvedAt === 1 ? 'degrau' : 'degraus'}.
            </p>
          </div>

          <div className="animate-rise rounded-card border border-line bg-surface p-4">
            <p className="label-caps mb-2 text-accent">nova ramificação de aprendizado</p>
            <p className="text-xs text-dim">Da próxima vez, a dica começa um degrau mais longe.</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full rounded-card border border-line bg-surface px-4 py-4 text-xs font-semibold"
          >
            Ver outra palavra
          </button>
        </div>
      )}

      <p className="mt-2 text-[0.68rem] leading-relaxed text-faint">
        Um toque, alvo grande, sem gesto composto — apraxia atinge cerca de metade das pessoas com
        lesão no hemisfério esquerdo.
      </p>
    </section>
  )
}
