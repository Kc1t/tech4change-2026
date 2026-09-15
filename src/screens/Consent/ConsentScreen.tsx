import { useState } from 'react'
import { useApp } from '@/store'
import { speak, vibrate } from '@/channels'
import { useRoute } from '@/hooks/useRoute'

const QUESTIONS = [
  {
    pictogram: '👂',
    question: 'O aparelho pode escutar para te ajudar?',
    explanation: 'Ele escuta, mas não guarda. O som some em dez segundos.'
  },
  {
    pictogram: '🖼️',
    question: 'Podemos olhar suas fotos para montar o seu mapa?',
    explanation: 'As fotos ficam no seu aparelho. Nada é enviado.'
  },
  {
    pictogram: '👩‍⚕️',
    question: 'Sua fonoaudióloga pode ver seu progresso?',
    explanation: 'Só ela. Você pode desligar isso quando quiser.'
  },
  {
    pictogram: '🔒',
    question: 'Podemos usar o que você faz para melhorar o sistema?',
    explanation: 'Isso é opcional. Dizer não não muda nada do resto.'
  }
]

export function ConsentScreen() {
  const channels = useApp(s => s.channels)
  const discretion = useApp(s => s.discretion)
  const intensity = useApp(s => s.intensity)
  const [index, setIndex] = useState(0)
  const [, navigate] = useRoute()

  const question = QUESTIONS[index]!

  function answer() {
    vibrate('confirm', channels, intensity)
    if (index + 1 >= QUESTIONS.length) {
      setIndex(0)
      navigate('review')
      return
    }
    setIndex(index + 1)
  }

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">
          primeiro acesso · pergunta {index + 1} de {QUESTIONS.length}
        </p>
        <h2 className="voice mt-2 text-xl leading-tight">Quem autoriza é você</h2>
        <p className="mt-1 text-xs text-dim">
          Afasia não é incapacidade civil. Nem um curador pode consentir por você sobre saúde e
          privacidade.
        </p>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {QUESTIONS.map((_, i) => (
          <i
            key={i}
            className={`block h-[3px] flex-1 rounded-sm ${i < index ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </div>

      <div className="rounded-panel border border-line bg-surface p-6">
        <div className="mb-4 text-[3.4rem] leading-none" aria-hidden="true">
          {question.pictogram}
        </div>
        <h3 className="voice text-xl leading-tight">{question.question}</h3>
        <p className="mt-2 text-xs text-dim">{question.explanation}</p>
        <button
          onClick={() =>
            speak(
              `${question.question} ${question.explanation}`,
              { ...channels, earbuds: true },
              discretion
            )
          }
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs text-dim"
        >
          🔊 Ouvir a pergunta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={answer}
          className="rounded-card border border-line bg-surface px-3 py-4 font-semibold"
        >
          Não
        </button>
        <button
          onClick={answer}
          className="rounded-card border border-fg bg-fg px-3 py-4 font-semibold text-ink"
        >
          Sim
        </button>
      </div>

      <p className="text-[0.68rem] leading-relaxed text-faint">
        Uma pergunta por tela, pictograma, áudio e resposta binária — o padrão de acessibilidade que
        a LGPD exige quando o titular tem comunicação reduzida.
      </p>
    </section>
  )
}
