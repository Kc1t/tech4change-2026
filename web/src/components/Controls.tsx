'use client'

interface SwitchProps {
  checked: boolean
  label: string
  disabled?: boolean
  onChange: () => void
}

export function Switch({ checked, label, disabled, onChange }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors',
        checked ? 'bg-brand' : 'bg-line',
        disabled ? 'opacity-40' : ''
      ].join(' ')}
      style={{ minHeight: 30 }}
    >
      <span
        className="absolute left-[3px] top-[3px] h-6 w-6 rounded-full bg-surface shadow-soft transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'none' }}
      />
    </button>
  )
}

interface SegmentedProps<T extends string> {
  value: T
  options: Array<{ value: T; label: string; hint: string }>
  onChange: (next: T) => void
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedProps<T>) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-card bg-surface-2 p-1">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={[
            'rounded-[9px] px-1.5 py-3 text-[0.78rem] font-semibold leading-tight',
            option.value === value ? 'bg-surface text-fg shadow-soft' : 'text-dim'
          ].join(' ')}
        >
          {option.label}
          <span className="mt-0.5 block text-[0.62rem] font-normal text-faint">{option.hint}</span>
        </button>
      ))}
    </div>
  )
}

interface RowButtonProps {
  children: React.ReactNode
  onClick: () => void
}

export function RowButton({ children, onClick }: RowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-card border border-line bg-surface px-4 py-4 text-xs font-semibold active:scale-[0.99]"
    >
      {children}
    </button>
  )
}
