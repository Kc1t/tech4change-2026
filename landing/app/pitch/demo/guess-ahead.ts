import type { Guess } from '../eilo/types'
import type { Timed } from './model-client'

type Entry = { text: string; at: number; promise: Promise<Timed<Guess> | null>; result?: Timed<Guess> | null }

export class GuessAhead {
  private entry: Entry | null = null

  constructor(
    private readonly ask: (text: string) => Promise<Timed<Guess> | null>,
    private readonly retryMs: number
  ) {}

  request(text: string): Promise<Timed<Guess> | null> {
    const current = this.entry
    const now = performance.now()
    if (current?.text === text && (current.result !== null || now - current.at < this.retryMs)) return current.promise
    const entry: Entry = { text, at: now, promise: this.ask(text) }
    void entry.promise.then(result => {
      entry.result = result
    })
    this.entry = entry
    return entry.promise
  }

  resultFor(text: string): Timed<Guess> | null | undefined {
    return this.entry?.text === text ? this.entry.result : undefined
  }

  pending(): boolean {
    return this.entry !== null && this.entry.result === undefined
  }

  reset() {
    this.entry = null
  }
}
