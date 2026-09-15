import type { LadderStep } from '@/domain/types'

const KIND_LABEL: Record<LadderStep['kind'], string> = {
  category: 'categoria',
  relation: 'relação',
  place: 'lugar',
  use: 'uso',
  shape: 'forma',
  phonological: 'pista sonora'
}

interface StepProps {
  step: LadderStep
  dimmed: boolean
}

export function Step({ step, dimmed }: StepProps) {
  const pulses = step.isFinal ? 1 : Math.min(step.level, 3)

  return (
    <div
      className={[
        'animate-rise rounded-card border p-4',
        step.isFinal ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
        dimmed ? 'opacity-50' : ''
      ].join(' ')}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="label-caps">
          degrau {step.level} · {KIND_LABEL[step.kind]}
        </span>
        <span className="ml-auto flex gap-1" aria-hidden="true">
          {Array.from({ length: pulses }, (_, i) => (
            <i
              key={i}
              className={
                step.isFinal
                  ? 'block h-[5px] w-4 rounded-sm bg-accent'
                  : 'block h-[5px] w-[5px] rounded-full bg-faint'
              }
            />
          ))}
        </span>
      </div>

      <p className={`voice text-xl leading-tight ${step.isFinal ? 'text-accent' : ''}`}>
        {step.text}
      </p>

      {step.provenance && step.edgeId && (
        <p className="mt-2 flex items-center gap-2 text-[0.7rem] text-faint">
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.66rem] text-dim">
            {step.edgeId}
          </code>
          {step.provenance.detail}
        </p>
      )}
    </div>
  )
}
