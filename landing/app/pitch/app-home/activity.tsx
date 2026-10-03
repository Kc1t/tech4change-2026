import type { Activity } from '../demo/types'

export function ActivityIndicator({ activity, label }: { activity: Activity; label: string }) {
  return (
    <p className={`ah-caps ah-activity ah-activity--${activity}`} role="status" aria-live="polite">
      <span className="ah-activity__icon" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {label.toUpperCase()}
    </p>
  )
}
