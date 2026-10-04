'use client'

import { useRef } from 'react'
import type { Activity, DemoCue, LiveDemoState } from '../demo/types'
import { splitTurns } from '../eilo/stall'
import { ActivityIndicator } from './activity'
import { AuroraField, type OrbState } from './aurora'
import { Buddy, type BuddyMood } from './buddy'
import { BottomBar, BackdropToggle, BrandMark, NotificationBell } from './chrome'
import { flashFor, useTimedFlash } from './flash'
import { useCuePulse, useSpeaking, useWidth } from './hooks'
import { Typed } from './typed'
import './app-home.css'

const SCENE = {
  prompt: 'Vó, quem veio te visitar ontem?',
  attempt: 'A minha neta, a…'
}

const SPEECH_TAIL = 72

function tailOf(text: string) {
  if (text.length <= SPEECH_TAIL) return text
  const cut = text.slice(-SPEECH_TAIL)
  return `…${cut.slice(cut.indexOf(' ') + 1)}`
}

type Mic = LiveDemoState['mic']

export function AppHome({ cue, heard, mic = 'listening', activity }: { cue: DemoCue; heard: string; mic?: Mic; activity?: Activity }) {
  const root = useRef<HTMLDivElement>(null)
  const width = useWidth(root)
  const timedFlash = useTimedFlash(cue)
  const pulse = useCuePulse(cue)
  const talking = useSpeaking(heard.trim())

  const orbSize = Math.min(width * 0.52, 200)
  const buddySize = orbSize * 0.78

  const armed = mic !== 'off'
  const flash = armed ? flashFor(cue) : timedFlash
  const denied = mic === 'blocked' || mic === 'unsupported'
  const active = mic === 'listening' || mic === 'simulating'
  const speaking = activity ? activity === 'hearing' : active && talking
  const waiting = activity === 'waiting'
  const open = cue.phase === 'cue' || cue.phase === 'given'
  const resolved = cue.phase === 'success'
  const rungs = Math.max(cue.total - 1, 0)
  const level = Math.min(cue.level + 1, rungs)
  const used = cue.level + 1
  const filled = resolved ? used : level

  const orbState: OrbState = resolved
    ? 'delivering'
    : flash
      ? 'blocked'
      : speaking
        ? 'speaking'
        : armed || open
          ? 'listening'
          : 'off'

  const mood: BuddyMood = resolved
    ? 'happy'
    : !armed || waiting
      ? 'asleep'
      : flash && !flash.isWord
        ? 'cue'
        : speaking
          ? 'speaking'
          : 'listening'

  const shownActivity: Activity = !armed || denied
    ? 'off'
    : open
      ? 'helping'
      : resolved
        ? 'recalled'
        : activity ?? (speaking ? 'hearing' : 'listening')

  const status = !armed
    ? 'a escuta está em pausa'
    : denied
      ? 'sem microfone por enquanto'
      : open
        ? `dica ${level} de ${rungs}`
        : resolved
          ? 'você lembrou'
          : waiting
            ? 'diga “olá, eilo”'
            : shownActivity === 'thinking'
              ? 'pensando…'
              : speaking
                ? 'ouvindo a frase'
                : 'ouvindo com você'

  const expected = flash ? flash.text : resolved ? cue.text : SCENE.attempt
  const expectedKind = flash?.isWord || resolved ? 'word' : flash ? 'cue' : 'waiting'

  const speech = armed ? splitTurns(heard).answer : ''
  const focused = armed && (speech.length > 0 || open || resolved)
  const showExpected = armed ? expectedKind !== 'waiting' : !focused || expectedKind !== 'waiting'

  const caption = resolved
    ? `Você chegou lá com ${used} ${used === 1 ? 'pista' : 'pistas'}. A cada vez fica mais fácil.`
    : flash
      ? armed && flash.isWord ? 'aqui está a palavra, em voz alta' : flash.caption
      : armed
        ? waiting ? 'Estou dormindo. Diga “Olá, Eilo” para eu ajudar.' : 'Se a palavra não vier, eu percebo e ajudo. Sem pressa.'
        : 'Quando quiser, eu acompanho a conversa. Nada é gravado.'

  const lead = armed
    ? focused ? '' : waiting ? 'Para começar, diga “Olá, Eilo”.' : 'Pode falar no seu ritmo. Eu fico ouvindo.'
    : focused && speech !== SCENE.prompt ? SCENE.prompt : focused ? '' : speech || SCENE.prompt
  const dots = open || resolved ? rungs : 0
  const buddyHeight = buddySize * 1.25

  return (
    <div ref={root} className="ah">
      <div className="ah-wave">
        <AuroraField state={orbState} level={speaking ? 0.62 : armed ? 0.3 : 0} />
      </div>

      <div className="ah-top">
        <div className="ah-topbar">
          <div className="ah-topbar__side">
            <BrandMark />
          </div>
          <div className="ah-topbar__side">
            <BackdropToggle />
            <NotificationBell />
          </div>
        </div>
        <div>
          <ActivityIndicator activity={shownActivity} label={status} />
          <p className="ah-lead">{lead}</p>
          {active && (
            <div className="ah-pause">
              <i />
              <span>Pausar a escuta</span>
            </div>
          )}
        </div>
      </div>

      <div className="ah-stage">
        <div className={`ah-focus${focused ? ' is-focused' : ''}`} style={{ height: focused ? buddyHeight * 0.46 : buddyHeight }}>
          <div className="ah-focus__scale">
            <Buddy size={buddySize} mood={mood} level={speaking ? 0.6 : 0} pulse={pulse} />
          </div>
        </div>

        {armed && focused && speech.length > 0 && (
          <div className="ah-speech">
            <p className="ah-caps">Você disse</p>
            <p aria-live="polite" className={flash || resolved ? 'ah-speech__small' : 'ah-speech__big'}>
              “{tailOf(speech)}”
            </p>
          </div>
        )}

        {armed && (flash || resolved) && (
          <>
            <p className="ah-caps">{flash && !flash.isWord ? 'UMA PISTA' : 'A PALAVRA'}</p>
            {flash && !flash.isWord ? (
              <Typed key={flash.key} text={flash.text} className="ah-expected ah-expected--cue" />
            ) : (
              <p className="ah-expected ah-expected--word">{cue.text}</p>
            )}
          </>
        )}

        {!armed && focused && speech.length > 0 && (
          <div className="ah-speech">
            <p aria-live="polite" className={expectedKind === 'waiting' ? 'ah-speech__big' : 'ah-speech__small'}>
              {tailOf(speech)}
            </p>
          </div>
        )}

        {!armed && showExpected && (
          <>
            <p className="ah-caps">
              {expectedKind === 'word' ? 'A PALAVRA' : expectedKind === 'cue' ? 'UMA PISTA' : 'NO SEU TEMPO'}
            </p>
            {expectedKind === 'word' ? (
              <p className="ah-expected ah-expected--word">{expected}</p>
            ) : (
              <Typed text={expected} className={`ah-expected ah-expected--${expectedKind}`} />
            )}
          </>
        )}

        {caption && <p className="ah-caption">{caption}</p>}
      </div>

      <div className="ah-ladder">
        <div className="ah-ladder__dots">
          {Array.from({ length: dots }, (_, n) => (
            <i key={n} className={n + 1 <= filled ? 'on' : undefined} />
          ))}
        </div>
      </div>

      <BottomBar />
    </div>
  )
}
