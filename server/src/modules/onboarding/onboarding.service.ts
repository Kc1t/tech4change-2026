import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { completeChat } from '../../common/chat'
import { ONBOARDING_MAX_ANSWER, ONBOARDING_MAX_TOKENS, ONBOARDING_TIMEOUT_MS } from '../../common/constants'
import { SEED_SLOTS, type OnboardingTurnInput } from './dto/turn.dto'

type Slot = (typeof SEED_SLOTS)[number]

const SYSTEM = [
  'Você ajuda no primeiro acesso do eilo, um app para pessoas com afasia depois de um AVC.',
  'A pessoa responde do jeito dela. Sua tarefa é tirar da resposta só o que ela disse de fato, sem inventar nada:',
  '- owner: o primeiro nome de quem usa o app',
  '- person: o nome de alguém próximo que ela vê com frequência',
  '- relation: o que essa pessoa é dela, em minúsculas e no singular (neta, filho, esposa, vizinha, amigo)',
  '- place: a cidade onde essa pessoa mora',
  '- activity: uma atividade que ela disse que fazem juntos, curta e em minúsculas (almoço de domingo, caminhada); visitar não conta',
  '- object: uma coisa do dia a dia que ela usa, em minúsculas (escumadeira, bengala)',
  'Devolva só campos novos, que ainda não estão em "Já sabemos". Copie os nomes como ela escreveu.',
  'Considere a pergunta que acabou de ser feita: uma resposta curta como "Sorocaba" responde a ela.',
  'Escreva também "reply": uma frase curta e calorosa reagindo ao que ela contou, em português do Brasil, sem fazer pergunta, sem emoji, com no máximo 12 palavras.',
  'Responda só com JSON, sem texto fora dele, no formato {"answers":{"owner":"..."},"reply":"..."}. Deixe de fora os campos que ela não disse.'
].join('\n')

function parse(raw: string): { answers: Partial<Record<Slot, string>>; reply: string } | null {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const body = JSON.parse(raw.slice(start, end + 1)) as { answers?: Record<string, unknown>; reply?: unknown }
    const answers: Partial<Record<Slot, string>> = {}
    for (const slot of SEED_SLOTS) {
      const value = body.answers?.[slot]
      if (typeof value === 'string' && value.trim()) answers[slot] = value.trim().slice(0, ONBOARDING_MAX_ANSWER)
    }
    const reply = typeof body.reply === 'string' ? body.reply.replace(/\?/g, '.').trim().slice(0, 140) : ''
    return { answers, reply }
  } catch {
    return null
  }
}

@Injectable()
export class OnboardingService {
  async turn(input: OnboardingTurnInput) {
    const known = Object.entries(input.known)
      .filter(([, value]) => value)
      .map(([slot, value]) => `${slot}: ${value}`)
      .join('\n')

    const raw = await completeChat(
      [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: [
            `Já sabemos:\n${known || '(nada ainda)'}`,
            `Pergunta feita: ${input.asked || '(abertura)'}`,
            `Resposta: ${input.message}`
          ].join('\n\n')
        }
      ],
      { temperature: 0.2, maxTokens: ONBOARDING_MAX_TOKENS, timeoutMs: ONBOARDING_TIMEOUT_MS }
    )
    const result = raw ? parse(raw) : null
    if (!result) throw new ServiceUnavailableException('assistant unavailable')
    for (const slot of SEED_SLOTS) if (input.known[slot]) delete result.answers[slot]
    return result
  }
}
