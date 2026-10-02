import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { completeChat } from '../../common/chat'
import { ASK_MAX_TOKENS, ASK_TIMEOUT_MS } from '../../common/constants'
import type { HelpAskInput } from './dto/help-ask.dto'

const FACTS = [
  'O eilo é um app para pessoas com afasia depois de um AVC: a pessoa sabe a palavra, mas ela some no meio da frase.',
  'Como funciona: um toque liga a escuta e outro pausa. Enquanto a pessoa fala, o som vira texto na hora. Quando há uma pausa longa no meio da frase (1,3 a 3 segundos, a pessoa escolhe), o eilo percebe sozinho que a palavra travou.',
  'Aí ele dá uma pista por vez, da mais distante à mais próxima: categoria ("é da família"), relação, lugar e só no fim o começo do som ("Le…"). Quando a palavra sai, ele reconhece sozinho, comemora e volta a ouvir. Não tem botão de "lembrei".',
  'As pistas chegam na tela do celular, no fone, com voz escolhida pela pessoa, ou como vibração no relógio.',
  'O mapa da vida: na primeira vez, alguém da família responde perguntas curtas (quem mora junto, netos, cidade, bichos) e confirma o mapa. É dele que saem as pistas.',
  'A IA ordena as pistas, mas recebe só códigos opacos e ligações do mapa, nunca os nomes. Toda pista precisa citar uma ligação real do mapa; se não citar, o eilo usa uma escada pronta montada no aparelho.',
  'Privacidade: nada é gravado. O som vai para um serviço de transcrição, vira texto na hora e é descartado. Se a pessoa escolher uma voz, o texto da pista vai para o serviço de voz só para virar áudio; dá para usar sem voz.',
  'Sem internet, ele ainda percebe a pausa e dá pistas com a escada pronta do aparelho.',
  'O eilo não substitui a fonoaudióloga: leva para os outros dias da semana uma técnica que ela já usa na sessão (a pista em degraus) e devolve a ela um painel com a evolução, palavra por palavra, e um assistente que resume a semana.',
  'Não é app de exercício: sem metas, sem sequência, sem notificação. Fica quieto até a palavra faltar.',
  'É um protótipo acadêmico do FIAP Tech4Change 2026, feito pelo grupo 24. Dá para experimentar no navegador em /experimentar, com uma família de exemplo, e ver o painel da fono em /fono.'
].join('\n')

const SYSTEM = [
  'Você é o assistente de dúvidas da página do eilo. Responda só com base nos fatos abaixo.',
  'Responda em português do Brasil, em 2 a 4 frases curtas, com tom acolhedor e simples, como quem conversa com uma família.',
  'Se a resposta não estiver nos fatos, diga que não sabe e sugira experimentar o eilo ou falar com a equipe. Não invente números, preços nem datas.',
  'Não dê orientação médica nem diagnóstico; para isso, indique a fonoaudióloga.',
  'Se a pergunta não for sobre o eilo, diga com gentileza que você só tira dúvidas sobre o eilo.',
  '',
  'Fatos:',
  FACTS
].join('\n')

@Injectable()
export class HelpService {
  async ask(input: HelpAskInput): Promise<{ answer: string }> {
    const answer = await completeChat(
      [
        { role: 'system', content: SYSTEM },
        ...input.history.map(turn => ({ role: turn.role, content: turn.text })),
        { role: 'user', content: input.question }
      ],
      { temperature: 0.3, maxTokens: ASK_MAX_TOKENS, timeoutMs: ASK_TIMEOUT_MS }
    )
    if (!answer) throw new ServiceUnavailableException('assistant unavailable')
    return { answer }
  }
}
