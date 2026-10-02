'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUp, X } from 'lucide-react'
import { BuddyMark } from '@/components/fono/ai-assist'
import { HELP_TOPICS, STARTERS, topicById, type HelpLink, type HelpTopic } from './help-topics'

interface Turn {
  role: 'user' | 'assistant'
  text: string
  links?: HelpLink[]
  next?: string[]
}

const TEASERS = [
  'Tem dúvidas?',
  'Pergunta pra mim!',
  'Como eu funciono?',
  'Eu gravo a conversa? Pergunta aqui',
  'Posso te ajudar?'
]

const TEASER_MS = 3400

const GREETING = /^(oi+|ola|opa|eai|e ai|bom dia|boa tarde|boa noite|hey|hello)\b/
const THANKS = /(obrigad|valeu|brigad|agradeco)/

function fold(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function stem(word: string) {
  return word.replace(/(oes|aes|ais|eis|s)$/, '')
}

function sameWord(a: string, b: string) {
  if (a === b) return true
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  return short.length >= 4 && long.startsWith(short)
}

function score(topic: HelpTopic, question: string) {
  const padded = ` ${question} `
  const words = question.split(' ').filter(word => word.length > 1).map(stem)
  const perWord = new Map<string, number>()
  let total = 0
  for (const raw of topic.keywords) {
    const strong = raw.endsWith('*')
    const folded = fold(raw.replace(/\*$/, ''))
    const points = strong ? 6 : 3
    if (folded.includes(' ')) {
      if (padded.includes(` ${folded} `)) total += points + 2
      continue
    }
    for (const word of words) {
      if (sameWord(word, stem(folded))) perWord.set(word, Math.max(perWord.get(word) ?? 0, points))
    }
  }
  for (const points of perWord.values()) total += points
  for (const word of fold(topic.question).split(' ')) {
    if (word.length > 3 && words.some(candidate => sameWord(candidate, stem(word)))) total += 1
  }
  return total
}

function reply(question: string): Omit<Turn, 'role'> {
  const folded = fold(question)
  let best: { topic: HelpTopic | null; points: number } = { topic: null, points: 0 }
  for (const topic of HELP_TOPICS) {
    const points = score(topic, folded)
    if (points > best.points) best = { topic, points }
  }
  if (best.topic && best.points >= 2) {
    return { text: best.topic.answer, links: best.topic.links, next: best.topic.next }
  }
  if (THANKS.test(folded)) {
    return { text: 'De nada! Se surgir outra dúvida, é só me chamar aqui.', next: STARTERS.slice(0, 2) }
  }
  if (GREETING.test(folded)) {
    return { text: 'Oi! Pode perguntar do seu jeito. Estas são as dúvidas mais comuns:', next: STARTERS }
  }
  return {
    text: 'Essa eu ainda não sei responder. Tenta perguntar de outro jeito, ou escolhe uma destas:',
    next: STARTERS
  }
}

function typingDelay(text: string) {
  return 450 + Math.min(1300, text.length * 7)
}

function Chips({
  ids,
  asked,
  onPick
}: {
  ids: string[]
  asked: Set<string>
  onPick: (question: string) => void
}) {
  const topics = ids
    .map(topicById)
    .filter((topic): topic is HelpTopic => topic != null && !asked.has(topic.question))
  if (topics.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 pl-[2.1rem]">
      {topics.map(topic => (
        <button
          key={topic.id}
          type="button"
          onClick={() => onPick(topic.question)}
          className="rounded-full border border-[var(--v3-line)] bg-white px-3 py-1.5 text-[0.78rem] text-[#433d56] transition-colors hover:border-[#d9d3f5] hover:bg-[#faf9fd]"
        >
          {topic.question}
        </button>
      ))}
    </div>
  )
}

export function HelpChat() {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [teaser, setTeaser] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const asked = new Set(turns.filter(turn => turn.role === 'user').map(turn => turn.text))

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [turns, thinking])

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  useEffect(() => {
    if (open) return
    const timer = window.setInterval(() => setTeaser(index => (index + 1) % TEASERS.length), TEASER_MS)
    return () => window.clearInterval(timer)
  }, [open])

  function send(question: string) {
    const text = question.trim()
    if (!text || thinking) return
    const answer = reply(text)
    setTurns(previous => [...previous, { role: 'user', text }])
    setDraft('')
    setThinking(true)
    window.setTimeout(() => {
      setTurns(previous => [...previous, { role: 'assistant', ...answer }])
      setThinking(false)
    }, typingDelay(answer.text))
  }

  function follow(link: HelpLink) {
    if (!link.href.startsWith('#')) {
      window.location.assign(link.href)
      return
    }
    setOpen(false)
    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    send(draft)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <section
          role="dialog"
          aria-label="Tire suas dúvidas com o eilo"
          className="v3-bubble-in flex h-[min(540px,calc(100dvh-7rem))] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.4rem] border border-[var(--v3-line)] bg-white shadow-[0_30px_70px_-30px_rgba(60,45,110,0.55)]"
        >
          <header className="flex items-center gap-3 border-b border-[#efedf5] px-4 py-3.5">
            <BuddyMark size={32} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[0.95rem] font-semibold tracking-[-0.015em] text-[var(--v3-ink)]">Dúvidas sobre o eilo</h2>
              <p className="text-[0.74rem] text-[#8d8a9c]">Pergunte do seu jeito</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="grid size-8 place-items-center rounded-lg text-[#6a6779] transition-colors hover:bg-[#f3f1f8]"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex gap-2.5">
              <BuddyMark size={24} className="mt-0.5" />
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-2.5 text-[0.87rem] leading-relaxed text-[#3a3846]">
                Oi, eu sou o eilo. Posso te contar como eu funciono, o que acontece com o que eu ouço e
                como a fono acompanha. O que você quer saber?
              </p>
            </div>

            {turns.length === 0 && <Chips ids={STARTERS} asked={asked} onPick={send} />}

            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <p
                  key={index}
                  className="v3-bubble-in ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#433d56] px-3.5 py-2.5 text-[0.87rem] leading-relaxed text-white"
                >
                  {turn.text}
                </p>
              ) : (
                <div key={index} className="v3-bubble-in">
                  <div className="flex gap-2.5">
                    <BuddyMark size={24} className="mt-0.5" />
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-2.5 text-[0.87rem] leading-relaxed text-[#3a3846]">
                      {turn.text}
                      {turn.links && (
                        <span className="mt-2.5 flex flex-wrap gap-1.5">
                          {turn.links.map(link => (
                            <button
                              key={link.href}
                              type="button"
                              onClick={() => follow(link)}
                              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.78rem] font-medium text-[var(--v3-accent)] ring-1 ring-[#e4dcfb] transition-colors hover:bg-[#efe9fb]"
                            >
                              {link.label}
                              <ArrowRight className="size-3" />
                            </button>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  {index === turns.length - 1 && !thinking && turn.next && (
                    <div className="mt-2.5">
                      <Chips ids={turn.next} asked={asked} onPick={send} />
                    </div>
                  )}
                </div>
              )
            )}

            {thinking && (
              <div className="flex gap-2.5">
                <BuddyMark size={24} className="mt-0.5" />
                <p className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#f6f4fd] px-3.5 py-3" aria-label="Pensando">
                  {[0, 1, 2].map(dot => (
                    <span
                      key={dot}
                      className="v3-live-dot size-1.5 rounded-full bg-[#8e7ff0]"
                      style={{ animationDelay: `${dot * 180}ms` }}
                    />
                  ))}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-[#efedf5] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--v3-line)] bg-[#faf9fd] py-1.5 pr-1.5 pl-3.5 focus-within:border-[#d9d3f5]">
              <input
                ref={input}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                maxLength={400}
                placeholder="Escreva sua dúvida…"
                aria-label="Sua dúvida"
                className="min-w-0 flex-1 bg-transparent text-[0.88rem] text-[var(--v3-ink)] outline-none placeholder:text-[#a3a0b2]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="Enviar"
                className="grid size-8 place-items-center rounded-lg bg-[#433d56] text-white transition-opacity disabled:opacity-35"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex items-end gap-1">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative mb-12 rounded-2xl rounded-br-sm bg-white px-3.5 py-2 ring-1 ring-[var(--v3-line)] text-[0.84rem] font-medium whitespace-nowrap text-[#433d56] shadow-[0_12px_30px_-16px_rgba(60,45,110,0.55)]"
          >
            <span key={teaser} className="v3-bubble-in block">
              {TEASERS[teaser]}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-label={open ? 'Fechar as dúvidas' : 'Tirar uma dúvida com o eilo'}
          aria-expanded={open}
          className="group relative grid place-items-center px-1 pt-1 pb-3"
        >
          <span className="v3-buddy-float block transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
            <BuddyMark size={64} />
          </span>
        </button>
      </div>
    </div>
  )
}
