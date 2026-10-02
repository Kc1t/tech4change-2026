import { DEFAULT_FREE_BASE_URL, DEFAULT_FREE_MODEL } from './constants'

export function chatEndpoint(base: string): string {
  const trimmed = base.replace(/\/+$/, '')
  if (trimmed.endsWith('/chat/completions')) return trimmed
  return /\/v1$/.test(trimmed) ? `${trimmed}/chat/completions` : `${trimmed}/v1/chat/completions`
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function completeChat(
  messages: ChatMessage[],
  options: { temperature: number; maxTokens: number; timeoutMs: number }
): Promise<string | null> {
  const key = process.env.OPENAI_COMPAT_API_KEY
  if (!key) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs)
  const providers = process.env.MODEL_PROVIDER_ORDER?.split(',').map(p => p.trim()).filter(Boolean)
  const effort = process.env.MODEL_REASONING_EFFORT

  try {
    const response = await fetch(chatEndpoint(process.env.MODEL_BASE_URL ?? DEFAULT_FREE_BASE_URL), {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.CUE_MODEL ?? DEFAULT_FREE_MODEL,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        ...(effort ? { reasoning_effort: effort } : {}),
        ...(providers?.length ? { provider: { order: providers } } : {}),
        messages
      })
    })
    if (!response.ok) return null
    const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
    return body.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
