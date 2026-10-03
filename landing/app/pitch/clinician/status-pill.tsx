export function StatusPill({ live }: { live: boolean }) {
  return (
    <span className={`cd-pill ${live ? 'cd-pill--live' : 'cd-pill--demo'}`}>
      <span className="cd-live-dot" />
      {live ? 'ao vivo' : 'demonstração'}
    </span>
  )
}
