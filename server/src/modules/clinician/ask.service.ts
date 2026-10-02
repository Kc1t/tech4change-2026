import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { completeChat } from '../../common/chat'
import { ASK_MAX_TOKENS, ASK_TIMEOUT_MS } from '../../common/constants'
import type { AskInput } from './dto/ask.dto'

const SYSTEM = [
  'Você é o assistente do painel da fonoaudióloga no eilo, um app que ajuda pessoas com afasia a encontrar palavras no dia a dia.',
  'No app, quando a palavra trava, o eilo dá pistas em degraus: 0 = saiu sozinha, 1 = categoria, 2 = relação, 3 = lugar, 4 = som inicial. Degrau médio menor é melhor.',
  'Você recebe só números agregados e códigos opacos de palavras, como n_1fd17c. Você nunca sabe as palavras reais.',
  'Ao citar uma palavra, escreva o código exatamente entre colchetes, por exemplo [n_1fd17c]. A tela troca o código pelo nome.',
  'Responda em português do Brasil, em no máximo 4 frases curtas, com tom calmo e profissional, falando com a fonoaudióloga.',
  'Use só os dados recebidos e não invente números. Se faltar dado, diga isso.',
  'Não faça diagnóstico. Quando sugerir algo, deixe claro que a decisão é dela.',
  'Se a pergunta não for sobre este paciente ou estes dados, diga com gentileza que você só ajuda com o painel.'
].join('\n')

function describeContext(context: AskInput['context']): string {
  return JSON.stringify(
    {
      semana_atual: context.week,
      semana_anterior: context.previousWeek,
      degrau_medio_por_semana: context.weeklyLevels,
      escadas_desta_semana: context.ladders,
      palavras: context.words
    },
    null,
    0
  )
}

@Injectable()
export class AskService {
  async ask(input: AskInput): Promise<{ answer: string }> {
    const answer = await completeChat(
      [
        { role: 'system', content: SYSTEM },
        { role: 'system', content: `Dados do paciente: ${describeContext(input.context)}` },
        ...input.history.map(turn => ({ role: turn.role, content: turn.text })),
        { role: 'user', content: input.question }
      ],
      { temperature: 0.3, maxTokens: ASK_MAX_TOKENS, timeoutMs: ASK_TIMEOUT_MS }
    )
    if (!answer) throw new ServiceUnavailableException('assistant unavailable')
    return { answer }
  }
}
