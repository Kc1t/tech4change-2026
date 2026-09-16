const BLOBS = [
  'absolute -left-[10%] top-[10%] h-[60%] w-[70%] bg-aurora-1 [animation-duration:14s]',
  'absolute -right-[15%] top-[25%] h-[70%] w-[65%] bg-aurora-2 [animation-duration:17s]',
  'absolute -bottom-[20%] left-[10%] h-[55%] w-[80%] bg-aurora-3 [animation-duration:20s]',
  'absolute left-[35%] top-[30%] h-[35%] w-[40%] bg-aurora-4 [animation-duration:12s]'
]

export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-aurora-base saturate-[1.15] [animation:breathe_4.5s_ease-in-out_infinite]">
        {BLOBS.map(blob => (
          <span
            key={blob}
            className={`${blob} rounded-full opacity-90 blur-[38px] [animation-direction:alternate] [animation-iteration-count:infinite] [animation-name:drift] [animation-timing-function:ease-in-out]`}
          />
        ))}
        <span className="grain absolute inset-0 opacity-[0.18]" />
      </div>
    </div>
  )
}
