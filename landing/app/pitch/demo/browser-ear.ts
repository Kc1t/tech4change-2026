import { TIMING } from './config'

type SpeechAlternative = { transcript: string }
type SpeechResult = { isFinal: boolean; 0: SpeechAlternative }
type SpeechResultEvent = { resultIndex: number; results: ArrayLike<SpeechResult> }
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechResultEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type RecognitionConstructor = new () => Recognition

export type BrowserEarEvents = {
  onResult: (finals: string, interim: string) => void
  onBlocked: () => void
  onUnavailable: () => void
}

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function browserSpeechSupported(): boolean {
  return recognitionConstructor() !== null
}

export class BrowserEar {
  private recognition: Recognition | null = null
  private finals = ''
  private blocked = false

  constructor(private readonly events: BrowserEarEvents) {}

  get running(): boolean {
    return this.recognition !== null
  }

  start(): 'started' | 'blocked' | 'unsupported' {
    const Ctor = recognitionConstructor()
    if (!Ctor) return 'unsupported'
    const recognition = new Ctor()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = event => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) this.finals = `${this.finals} ${result[0].transcript}`.trim()
        else interim += result[0].transcript
      }
      this.events.onResult(this.finals, interim)
    }
    recognition.onerror = event => {
      if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') return
      this.blocked = true
      this.events.onBlocked()
    }
    recognition.onend = () => {
      if (this.blocked || this.recognition !== recognition) return
      window.setTimeout(() => {
        if (this.blocked || this.recognition !== recognition) return
        try {
          recognition.start()
        } catch {
          this.events.onUnavailable()
        }
      }, TIMING.browserRestartMs)
    }
    this.recognition = recognition
    this.blocked = false
    try {
      recognition.start()
      return 'started'
    } catch {
      return 'blocked'
    }
  }

  stop() {
    const recognition = this.recognition
    this.recognition = null
    if (!recognition) return
    recognition.onend = null
    recognition.abort()
  }
}
