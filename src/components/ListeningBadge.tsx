export function ListeningBadge() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line-soft bg-surface px-4 py-3 text-xs text-dim">
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        <i className="block w-[3px] rounded-sm bg-accent animate-breathe" style={{ height: 6 }} />
        <i className="block w-[3px] rounded-sm bg-accent animate-breathe" style={{ height: 13 }} />
        <i className="block w-[3px] rounded-sm bg-accent animate-breathe" style={{ height: 9 }} />
        <i className="block w-[3px] rounded-sm bg-accent animate-breathe" style={{ height: 16 }} />
      </span>
      <span>
        escutando · <strong className="font-semibold text-fg">nada é gravado em disco</strong>
      </span>
    </div>
  )
}
