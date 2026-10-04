const RETRY_BASE_MS = 1000
const RETRY_MAX_MS = 15_000

export function keepStreaming(url: string, attach: (source: EventSource) => void): () => void {
  let source: EventSource | null = null
  let failures = 0
  let timer = 0
  let closed = false

  const open = () => {
    const current = new EventSource(url)
    source = current
    attach(current)
    current.addEventListener('open', () => {
      failures = 0
    })
    current.addEventListener('error', () => {
      if (closed || current.readyState !== EventSource.CLOSED) return
      timer = window.setTimeout(open, Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** failures))
      failures += 1
    })
  }

  open()
  return () => {
    closed = true
    window.clearTimeout(timer)
    source?.close()
  }
}
