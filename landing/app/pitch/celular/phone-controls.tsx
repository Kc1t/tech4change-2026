'use client'

import type { LiveDemoState } from '../demo/types'

type Controls = { wake: () => void; nextLevel: () => void; giveWord: () => void; reset: () => void }

const ACTIVITY_LABEL: Record<LiveDemoState['activity'], string> = {
  off: 'parado',
  waiting: 'dormindo · diga “Olá, Eilo”',
  listening: 'acordado · ouvindo',
  hearing: 'ouvindo a frase',
  thinking: 'pensando',
  helping: 'ajudando',
  recalled: 'lembrou'
}

function cueLabel(cue: LiveDemoState['cue']): string {
  if (cue.phase === 'idle') return 'sem ajuda agora'
  if (cue.phase === 'success') return `lembrou: ${cue.text}`
  if (cue.phase === 'given') return `palavra dada: ${cue.text}`
  return `pista ${cue.level + 1} de ${Math.max(cue.total - 1, 1)}: ${cue.text}`
}

function ms(value: number | null): string {
  return value === null ? '–' : `${(value / 1000).toFixed(1)} s`
}

export function PhoneControls({ state, paused, controls, onClose }: { state: LiveDemoState; paused: boolean; controls: Controls; onClose: () => void }) {
  const asleep = state.activity === 'waiting'
  const helping = state.cue.phase === 'cue'
  const rows: Array<[string, string]> = [
    ['Eilo', paused ? 'em pausa até o slide da demo' : ACTIVITY_LABEL[state.activity]],
    ['Ouvi', state.words.slice(-14).join(' ') || '…'],
    ['Palpite', state.guess?.word ? `${state.guess.word} · ${Math.round(state.guess.confidence * 100)}%` : '–'],
    ['Agora', cueLabel(state.cue)],
    ['Tempo', `transcrição ${ms(state.latency.stt)} · IA ${ms(state.latency.complete)}`]
  ]
  return (
    <div className="phone-controls" role="dialog" aria-label="Controles da demo">
      <div className="phone-controls__head">
        <b>Controles</b>
        <span>só aparecem aqui, não no telão</span>
        <button onClick={onClose} aria-label="Fechar controles">fechar</button>
      </div>
      <dl>
        {rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="phone-controls__actions">
        <button onClick={controls.wake} disabled={paused || !asleep}>Acordar</button>
        <button onClick={controls.nextLevel} disabled={paused || asleep}>Próxima pista</button>
        <button onClick={controls.giveWord} disabled={paused || !helping}>Dar a palavra</button>
        <button onClick={controls.reset}>Recomeçar</button>
      </div>
    </div>
  )
}
