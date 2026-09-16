'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/store'
import { speak, vibrate } from '@/channels'
import { useRouter } from 'next/navigation'
import { DENIED_CONSENT, readConsent, writeConsent, type ConsentState } from '@/api/client'

const QUESTIONS: Array<{ key: keyof ConsentState; pictogram: string; question: string; explanation: string }> = [
  {
    key: 'listening',
    pictogram: '👂',
    question: 'O aparelho pode escutar para te ajudar?',
    explanation: 'Ele escuta, mas não guarda. O som some em dez segundos.'
  },
  {
    key: 'photos',
    pictogram: '🖼️',
    question: 'Podemos olhar suas fotos para montar o seu mapa?',
    explanation: 'As fotos ficam no seu aparelho. Nada é enviado.'
  },
  {
    key: 'clinician',
    pictogram: '👩‍⚕️',
    question: 'Sua fonoaudióloga pode ver seu progresso?',
    explanation: 'Só ela. Você pode desligar isso quando quiser.'
  },
  {
    key: 'research',
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
  const [answers, setAnswers] = useState<ConsentState>(DENIED_CONSENT)
  const [stored, setStored] = useState<'pendente' | 'servidor' | 'aparelho'>('pendente')
  const router = useRouter()

  useEffect(() => {
    void readConsent().then(record => {
      if (!record) return
      setAnswers({
        listening: record.listening,
        photos: record.photos,
        clinician: record.clinician,
        research: record.research
      })
    })
  }, [])

  const question = QUESTIONS[index]!

  function answer(allowed: boolean) {
    vibrate('confirm', channels, intensity)
    const next = { ...answers, [question.key]: allowed }
    setAnswers(next)

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1)
      return
    }

    void writeConsent(next).then(saved => setStored(saved ? 'servidor' : 'aparelho'))
    setIndex(0)
    router.push('/review')
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
            className={`block h-[3px] flex-1 rounded-sm ${i < index ? 'bg-brand' : 'bg-line'}`}
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
          onClick={() => answer(false)}
          className="rounded-card border border-line bg-surface px-3 py-4 font-semibold"
        >
          Não
        </button>
        <button
          onClick={() => answer(true)}
          className="rounded-card border border-fg bg-fg px-3 py-4 font-semibold text-ink"
        >
          Sim
        </button>
      </div>

      {stored !== 'pendente' && (
        <p className="text-[0.72rem] text-dim">
          {stored === 'servidor'
            ? 'Resposta registrada no servidor, com data e hora.'
            : 'Servidor fora do ar — a resposta vale neste aparelho e sobe depois.'}
        </p>
      )}

      <p className="text-[0.68rem] leading-relaxed text-faint">
        Uma pergunta por tela, pictograma, áudio e resposta binária — o padrão de acessibilidade que
        a LGPD exige quando o titular tem comunicação reduzida. Cada resposta é gravada
        separadamente, porque dizer não a uma não pode desligar as outras.
      </p>
    </section>
  )
}
