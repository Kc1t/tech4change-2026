'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AppHome } from '../pitch/app-home/home'
import type { DemoCue, LiveDemoState } from '../pitch/demo/types'
import { INITIAL_STATE } from '../pitch/demo/types'
import { useLiveDemo } from '../pitch/demo/use-live-demo'
import { nextVoiceMode, useVoice, VOICE_MODE_LABEL, type Voice, type VoiceMode } from '../pitch/eilo/voice'
import { vibrationPattern } from '../pitch/sync'
import { Logo } from '@/components/v3/logo'
import './try-app.css'

type Mode = 'live' | 'watch'

const SUGGESTION = 'Ontem a minha neta veio me visitar, a…'

const STEPS = [
  { phase: 'idle', title: 'Fale e deixe a palavra travar', body: 'Conte quem veio te visitar ontem. Quando o nome não vier, faça uma pausa.' },
  { phase: 'cue', title: 'Ele percebe a pausa', body: 'Uma pista por vez: primeiro quem é a pessoa, depois o lugar, por último o começo do som.' },
  { phase: 'success', title: 'A palavra sai de você', body: 'Quando você diz o nome, ele reconhece e comemora. Quem achou foi você.' }
] as const

function stepOf(cue: DemoCue): number {
  if (cue.phase === 'success' || cue.phase === 'given') return 2
  if (cue.phase === 'cue') return 1
  return 0
}

function useBuzz() {
  const last = useRef('')
  return useCallback((cue: DemoCue) => {
    const key = `${cue.phase}-${cue.level}`
    if (cue.phase === 'idle' || key === last.current) {
      if (cue.phase === 'idle') last.current = ''
      return
    }
    last.current = key
    const pattern = vibrationPattern(cue)
    if (pattern.length && 'vibrate' in navigator) navigator.vibrate(pattern)
  }, [])
}

function Session({
  mode,
  voice,
  voiceMode,
  onState,
  onSwitch
}: {
  mode: Mode
  voice: Voice | null
  voiceMode: VoiceMode
  onState: (state: LiveDemoState) => void
  onSwitch: (mode: Mode) => void
}) {
  const buzz = useBuzz()
  const { state, reset, nextLevel, giveWord, simulate } = useLiveDemo(true, buzz, {
    voice,
    listen: mode === 'live',
    wakeWord: false
  })

  useEffect(() => {
    if (mode === 'watch') simulate()
  }, [mode, simulate])

  useEffect(() => {
    onState(state)
  }, [state, onState])

  const denied = mode === 'live' && (state.mic === 'blocked' || state.mic === 'unsupported')
  const insecure = typeof window !== 'undefined' && !window.isSecureContext
  const finished = state.cue.phase === 'success' || state.cue.phase === 'given'

  return (
    <>
      <AppHome
        cue={state.cue}
        heard={state.words.join(' ')}
        mic={mode === 'watch' ? 'simulating' : state.mic}
        activity={state.activity}
      />

      {mode === 'live' && state.cue.phase === 'idle' && state.words.length === 0 && !denied && (
        <div className="try-hint" role="status">
          <span>Tente dizer</span>
          <b>“{SUGGESTION}”</b>
        </div>
      )}

      {denied && (
        <div className="try-alert" role="alert">
          <b>{state.mic === 'blocked' ? 'O microfone está bloqueado' : 'Este navegador não ouve'}</b>
          <span>
            {insecure
              ? 'Abra o endereço com https:// para o navegador liberar o microfone.'
              : 'Toque no cadeado ao lado do endereço, libere o microfone e recarregue a página.'}
          </span>
          <button type="button" onClick={() => onSwitch('watch')}>
            Só assistir
          </button>
        </div>
      )}

      <div className="try-tools">
        {!finished && (
          <>
            <button type="button" className="is-main" onClick={nextLevel}>
              Me dá uma pista
            </button>
            {state.cue.phase === 'cue' && (
              <button type="button" onClick={giveWord}>
                Diz a palavra
              </button>
            )}
          </>
        )}
        <button type="button" className={finished ? 'is-main' : undefined} onClick={mode === 'watch' ? simulate : reset}>
          {mode === 'watch' ? 'Ver de novo' : 'Recomeçar'}
        </button>
        <button
          type="button"
          aria-pressed={voiceMode !== 'off'}
          onClick={() => {
            voice?.unlock()
            voice?.setMode(nextVoiceMode(voiceMode))
          }}
        >
          {VOICE_MODE_LABEL[voiceMode]}
        </button>
        <button type="button" onClick={() => onSwitch(mode === 'live' ? 'watch' : 'live')}>
          {mode === 'live' ? 'Só assistir' : 'Falar de verdade'}
        </button>
      </div>
    </>
  )
}

function Start({ onPick }: { onPick: (mode: Mode) => void }) {
  return (
    <div className="try-start">
      <div className="try-start__card">
        <p className="try-start__eyebrow">Experimente o eilo</p>
        <h1>Imagine que você é a Helena.</h1>
        <p>Sua filha pergunta quem veio te visitar ontem. Você sabe que foi a sua neta, mas o nome não vem.</p>
        <button type="button" className="try-start__main" onClick={() => onPick('live')}>
          <b>Falar de verdade</b>
          <span>Libere o microfone e responda em voz alta: “{SUGGESTION}”</span>
        </button>
        <button type="button" className="try-start__alt" onClick={() => onPick('watch')}>
          <b>Só assistir</b>
          <span>Uma conversa de exemplo, sem microfone</span>
        </button>
      </div>
    </div>
  )
}

export function TryApp() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [state, setState] = useState<LiveDemoState>(INITIAL_STATE)
  const { voice, mode: voiceMode } = useVoice()
  const step = mode ? stepOf(state.cue) : -1

  const pick = (next: Mode) => {
    voice?.unlock()
    if ('vibrate' in navigator) navigator.vibrate(40)
    setState(INITIAL_STATE)
    setMode(next)
  }

  return (
    <main className="try">
      <header className="try-head">
        <a href="/" className="try-back">
          <ArrowLeft className="size-4" />
          Voltar para a página
        </a>
        <a href="/" aria-label="eilo">
          <Logo className="h-6" />
        </a>
      </header>

      <div className="try-body">
        <div className="try-frame">
          {mode ? (
            <Session key={mode} mode={mode} voice={voice} voiceMode={voiceMode} onState={setState} onSwitch={pick} />
          ) : (
            <>
              <AppHome cue={INITIAL_STATE.cue} heard="" mic="off" />
              <Start onPick={pick} />
            </>
          )}
        </div>

        <ol className="try-guide" aria-label="O que acontece">
          {STEPS.map((item, index) => (
            <li key={item.phase} className={index === step ? 'is-on' : index < step ? 'is-done' : undefined}>
              <span>{index + 1}</span>
              <div>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="try-note">Protótipo acadêmico. Não substitui a fonoaudióloga.</p>
    </main>
  )
}
