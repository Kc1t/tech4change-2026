import { screenTranscript } from '../eilo/text-safety'
import { TIMING, WORD_COUNTS } from './config'
import { lastWords, wordsOf } from './text'

function screenSegment(text: string): string {
  return screenTranscript(text, WORD_COUNTS.segmentChars, WORD_COUNTS.segmentWords).text
}

export class TranscriptBuffer {
  private finalText = ''
  private interimText = ''
  private committed = new Map<number, string>()
  private partial: { segment: number; text: string } | null = null
  private browserFinal = ''
  private browserInterim = ''
  private browserMark = 0
  private dropped: Array<[number, number]> = []
  private lastCommitAt = 0
  private vadAt = -Infinity
  heardByBrowser = { text: '', at: -Infinity }

  get text(): string {
    return `${this.finalText} ${this.interimText}`.trim()
  }

  get interim(): string {
    return this.interimText
  }

  get wordCount(): number {
    return wordsOf(this.text).length
  }

  set(finalText: string, interim: string) {
    this.finalText = finalText
    this.interimText = interim
  }

  vadAlive(now: number): boolean {
    return now - this.vadAt < TIMING.vadAliveMs
  }

  noteVoice(now: number) {
    this.vadAt = now
  }

  notePartial(segment: number, text: string): boolean {
    if (this.committed.has(segment)) return false
    const screened = screenSegment(wordsOf(text).slice(0, -1).join(' '))
    if (!screened) return false
    this.partial = { segment, text: screened }
    return true
  }

  noteCommit(segment: number, text: string) {
    this.committed.set(segment, screenSegment(text))
    if (this.partial && this.partial.segment <= segment) this.partial = null
    this.lastCommitAt = performance.now()
    this.markBrowserConsumed()
  }

  noteBrowser(finals: string, interim: string, deaf: boolean): 'dropped' | 'heard' {
    const before = this.browserFinal.length
    this.browserFinal = finals
    if (deaf) {
      if (finals.length > before) this.dropped.push([before, finals.length])
      this.browserInterim = ''
      return 'dropped'
    }
    this.browserInterim = interim.trim()
    this.heardByBrowser = { text: lastWords(`${this.browserSince(this.browserMark)} ${interim}`, WORD_COUNTS.recent), at: performance.now() }
    return 'heard'
  }

  browserOnly(): { final: string; interim: string } {
    return { final: this.browserSince(this.browserMark), interim: this.browserInterim }
  }

  syncBrowserMark(now: number) {
    if (this.vadAlive(now) && this.vadAt < this.lastCommitAt) this.markBrowserConsumed()
  }

  markBrowserConsumed() {
    this.browserMark = this.browserFinal.length
    this.browserInterim = ''
  }

  dropPartial() {
    this.partial = null
  }

  composeCloud(now: number): { final: string; interim: string } {
    const committed = [...this.committed.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(entry => entry[1])
      .filter(Boolean)
      .join(' ')
    const freshBrowser = !this.vadAlive(now) || this.vadAt > this.lastCommitAt
    const browserTail = `${this.browserSince(this.browserMark)} ${this.browserInterim}`.trim()
    const partial = this.partial?.text ?? ''
    return { final: committed, interim: partial || (freshBrowser ? browserTail : '') }
  }

  reset() {
    this.finalText = ''
    this.interimText = ''
    this.committed.clear()
    this.partial = null
    this.dropped = []
    this.markBrowserConsumed()
  }

  private browserSince(mark: number): string {
    let out = ''
    let at = mark
    for (const [start, end] of this.dropped) {
      if (end <= at) continue
      out += this.browserFinal.slice(at, Math.max(at, start))
      at = Math.max(at, end)
    }
    return `${out}${this.browserFinal.slice(at)}`.replace(/\s+/g, ' ').trim()
  }
}
