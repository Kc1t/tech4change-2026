import { Card } from '@/components/layout'

export function StatCard({
  label,
  value,
  unit,
  delta,
  tone = 'up'
}: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone?: 'up' | 'note' | 'down'
}) {
  const deltaColor =
    tone === 'up' ? 'text-delta-up' : tone === 'note' ? 'text-delta-note' : 'text-delta-down'

  return (
    <Card className="flex-1">
      <p className="mb-1 text-sm font-medium leading-none text-faint">{label}</p>
      <p className="flex items-baseline text-2xl font-bold tracking-[-0.03em] text-fg tabular">
        {value}
        {unit && <span className="ml-1 text-lg font-semibold text-faint">{unit}</span>}
      </p>
      <p className={`mt-2 min-h-[15px] text-xs font-semibold leading-none ${deltaColor}`}>
        {delta ?? ''}
      </p>
    </Card>
  )
}
