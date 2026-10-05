import { useEffect, useMemo, useRef, useState } from 'react'
import { AppHome } from '../app-home/home'
import { PITCH_ASSETS } from '../deck/assets'
import { motionDelay } from '../deck/motion'
import type { DemoCue } from '../demo/types'
import { useLiveDemo } from '../demo/use-live-demo'
import { splitTurns } from '../eilo/stall'
import { DECK_MODE_KEY, useVoice, VOICE_MODE_LABEL } from '../eilo/voice'
import { useRemoteDemo, vibrationPattern } from '../sync'
import { buzzOf } from '../watch-mock/buzz'
import { WatchMock } from '../watch-mock/watch'
import { DemoReserve } from './demo-reserve'
import './live-demo.css'

const PLACEHOLDER = 'Ah, saí de casa sem a… a…'
const BUBBLE_WORDS = 8
const MIN_QUESTION_WORDS = 2
const CLOCK_MS = 10_000
const ORDINAL = ['Um', 'Dois', 'Três', 'Quatro', 'Cinco']

const KIND_COPY: Record<string, string> = {
  category: 'A frase travou. A primeira dica diz do que se trata, e o pulso vibra uma vez.',
  relation: 'Ainda não veio. Mais um detalhe, e o pulso vibra de novo.',
  place: 'Mais uma pista: onde fica. Ainda sem entregar a palavra.',
  use: 'Mais uma pista: para que serve.',
  shape: 'Mais uma pista: como é.',
  phonological: 'Só o som do começo, no celular e no pulso. A palavra continua sendo de quem fala.'
}

const ORIGIN_BADGE: Record<string, { label: string; ai: boolean }> = {
  offline: { label: 'escada no aparelho', ai: false },
  deterministic: { label: 'escada padrão', ai: false },
  model: { label: 'IA · ordem escolhida agora', ai: true },
  cache: { label: 'IA · ordem já aprendida', ai: true },
  openrouter: { label: 'IA · ordem escolhida agora', ai: true }
}

function clock() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function lastWords(text: string) {
  return text.split(' ').slice(-BUBBLE_WORDS).join(' ')
}

function bubbleTurns(heard: string): { question: string | null; answer: string } {
  const { question, answer } = splitTurns(heard)
  const whole = question !== null && question.split(' ').length >= MIN_QUESTION_WORDS
  return { question: whole ? lastWords(question) : null, answer: lastWords(answer) }
}

function stepCopy(cue: DemoCue, heard: boolean) {
  if (cue.phase === 'idle') {
    return heard
      ? { title: 'Ouvindo', text: 'A frase vai chegando. Se ela parar no meio, o Eilo percebe a pausa.' }
      : { title: 'Ouvindo', text: 'O Eilo acompanha a conversa e espera. Se a palavra sumir, ele percebe a pausa.' }
  }
  if (cue.phase === 'success') return { title: 'Lembrou', text: 'Quem achou a palavra foi quem falava. O Eilo guarda em qual dica ela veio.' }
  if (cue.phase === 'given') return { title: 'A palavra', text: 'Quando não vem, o Eilo fala a palavra e anota onde precisou de ajuda.' }
  return { title: `Passo ${ORDINAL[cue.level] ?? cue.level + 1}`, text: KIND_COPY[cue.kind ?? ''] ?? KIND_COPY.category }
}

function useClock() {
  const [time, setTime] = useState(clock)
  useEffect(() => {
    const timer = window.setInterval(() => setTime(clock()), CLOCK_MS)
    return () => window.clearInterval(timer)
  }, [])
  return time
}

export function LiveDemoSlide() {
  const { remote, connected } = useRemoteDemo()
  const { voice, mode } = useVoice(DECK_MODE_KEY)
  const { state: local, nextLevel, reset, simulate } = useLiveDemo(!connected, () => {}, { voice: connected ? null : voice, listen: false })
  const state = remote ?? local
  const time = useClock()
  const phone = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (connected) voice?.stop()
  }, [connected, voice])

  const relayed = useRef<number | null | undefined>(undefined)
  const speech = remote?.speech
  useEffect(() => {
    if (!connected) return
    const id = speech?.id ?? null
    if (relayed.current === undefined || id === relayed.current) {
      relayed.current = id
      return
    }
    relayed.current = id
    if (speech) void voice?.say(speech.text)
  }, [connected, speech, voice])

  useEffect(() => {
    const unlock = () => voice?.unlock()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [voice])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      const toggleVoice = () => voice?.setMode(voice.mode() === 'off' ? 'on' : 'off')
      const actions: Record<string, () => void> = { KeyD: nextLevel, KeyX: reset, KeyS: simulate, KeyV: toggleVoice }
      const action = actions[event.code]
      if (!action) return
      event.preventDefault()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextLevel, reset, simulate, voice])

  const cue = state.cue
  const heard = state.words.join(' ')
  const copy = stepCopy(cue, heard.length > 0)
  const turns = bubbleTurns(heard)
  const buzzing = cue.phase === 'cue' || cue.phase === 'given'
  const origin = cue.origin ? ORIGIN_BADGE[cue.origin] : undefined
  const offline = (cue.network ?? local.network) === 'offline'

  const { phase, level } = cue
  const buzz = useMemo(() => buzzOf(vibrationPattern({ phase, level })), [phase, level])

  useEffect(() => {
    if (buzzing && buzz.duration > 0) phone.current?.animate(buzz.keyframes, { duration: buzz.duration })
  }, [buzzing, buzz])

  return (
    <div className="live-demo">
      <div className="abs story rise" style={motionDelay(150)}>
        <img className="portrait" src={`${PITCH_ASSETS}/passo-ela.png`} alt="" />
        <div className="fade" />
        {turns.question && <div key={turns.question} className="question"><span>{turns.question}</span></div>}
        {(!heard || turns.answer) && <div className="speech"><span>“{heard ? turns.answer : PLACEHOLDER}”</span></div>}
        {origin && cue.phase !== 'idle' && (
          <span key={cue.origin} className={`origin${origin.ai ? ' origin--ai' : ''}`}>{origin.label}</span>
        )}
        <div key={`${cue.phase}-${cue.level}`} className="step">
          <h3>{copy.title}</h3>
          <p>{copy.text}</p>
        </div>
      </div>
      <div className="abs screen rise" style={motionDelay(350)}>
        <div ref={phone} className="phone">
          <div className="ah-frame">
            <AppHome cue={cue} heard={heard} mic={state.mic} activity={state.activity} />
          </div>
        </div>
        <WatchMock cue={cue} time={time} buzzing={buzzing} />
        {offline ? (
          <div className="demo-note"><span className="demo-note-chip">sem internet · escada no aparelho</span></div>
        ) : !connected && mode === 'off' && (
          <div className="demo-note"><span className="demo-note-chip">{VOICE_MODE_LABEL[mode]} · V muda</span></div>
        )}
      </div>
      <DemoReserve />
    </div>
  )
}
