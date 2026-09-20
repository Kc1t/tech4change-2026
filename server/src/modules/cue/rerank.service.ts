import { Injectable, Logger } from '@nestjs/common'
import {
  DEFAULT_FREE_BASE_URL,
  DEFAULT_FREE_MODEL,
  DEFAULT_MODEL,
  DEFAULT_MODEL_BASE_URL,
  MODEL_TIMEOUT_MS
} from '../../common/constants'
import { edgesOf, indexNodes, stepKindFor } from '../../domain/projection'
import type { CuePlan, GraphProjection, ScoredCandidate } from '../../domain/types'
import type { RankCueInput } from './dto/rank-cue.dto'

const SYSTEM = [
  'You rank candidates from a pseudonymised personal graph to help someone with anomia reach a word.',
  'You never see the words themselves, only opaque identifiers, node kinds, attribute keys and edges.',
  'Build a ladder of cues from broad to specific. Never emit a final step that would reveal the word.',
  'Every step must name an attribute key the target node owns, and an edge id connected to the target.',
  'Answer with JSON only, no prose, matching:',
  '{"targetId":string,"confidence":number,"alternatives":string[],"steps":[{"level":number,"attr":string,"edge":string|null}]}'
].join('\n')

@Injectable()
export class RerankService {
  private readonly logger = new Logger(RerankService.name)

  available(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY ?? process.env.OPENAI_COMPAT_API_KEY)
  }

  async rank(input: RankCueInput, pool: ScoredCandidate[]): Promise<CuePlan | null> {
    if (pool.length === 0) return null

    const prompt = this.describe(input.projection, pool, input.lastLevel)
    const free = process.env.OPENAI_COMPAT_API_KEY
    const raw = free
      ? await this.askOpenAICompatible(free, prompt)
      : await this.askAnthropic(prompt)

    return raw === null ? null : this.parse(raw)
  }

  private parse(raw: string): CuePlan | null {
    try {
      const parsed = JSON.parse(raw) as Omit<CuePlan, 'origin' | 'steps'> & {
        steps: Array<{ level: number; attr: string; edge: string | null }>
      }

      return {
        targetId: parsed.targetId,
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.slice(0, 4) : [],
        origin: 'model',
        steps: parsed.steps.map((step, i) => ({
          level: Number(step.level) || i + 1,
          kind: stepKindFor(step.attr),
          attr: step.attr,
          edge: step.edge ?? null
        }))
      }
    } catch {
      return null
    }
  }

  private async askOpenAICompatible(key: string, prompt: string): Promise<string | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

    try {
      const base = process.env.MODEL_BASE_URL ?? DEFAULT_FREE_BASE_URL
      const endpoint = base.includes('/chat/completions') ? base : `${base}/v1/chat/completions`
      const effort = process.env.MODEL_REASONING_EFFORT
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.CUE_MODEL ?? DEFAULT_FREE_MODEL,
          temperature: 0,
          max_tokens: 640,
          response_format: { type: 'json_object' },
          ...(effort ? { reasoning_effort: effort } : {}),
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: prompt }
          ]
        })
      })

      if (!response.ok) {
        this.logger.warn(`Model responded ${response.status}`)
        return null
      }

      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      return body.choices?.[0]?.message?.content ?? null
    } catch (error) {
      this.logger.warn(`Model rerank skipped: ${(error as Error).name}`)
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  private async askAnthropic(prompt: string): Promise<string | null> {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

    try {
      const base = process.env.MODEL_BASE_URL ?? DEFAULT_MODEL_BASE_URL
      const response = await fetch(`${base}/v1/messages`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.CUE_MODEL ?? DEFAULT_MODEL,
          max_tokens: 640,
          system: SYSTEM,
          messages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: '{' }
          ]
        })
      })

      if (!response.ok) {
        this.logger.warn(`Model responded ${response.status}`)
        return null
      }

      const body = (await response.json()) as { content?: Array<{ text?: string }> }
      const raw = body.content?.[0]?.text
      return typeof raw === 'string' ? `{${raw}` : null
    } catch (error) {
      this.logger.warn(`Model rerank skipped: ${(error as Error).name}`)
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  private describe(
    projection: GraphProjection,
    pool: ScoredCandidate[],
    lastLevel: number | null
  ): string {
    const nodes = indexNodes(projection)
    const lines = pool.map(candidate => {
      const node = nodes.get(candidate.id)
      if (!node) return ''
      const edges = edgesOf(projection, node.id)
        .map(edge => `${edge.id}(${edge.rel},${edge.weight})`)
        .join(' ')
      return `${node.id} kind=${node.kind} attrs=[${node.attrKeys.join(',')}] phon=${node.hasPhonology} edges=${edges} activation=${candidate.score.toFixed(3)}`
    })

    return [
      lastLevel === null
        ? 'This is a first attempt at this target.'
        : `On the previous attempt the person unlocked at rung ${lastLevel}. Aim one rung shorter.`,
      'Candidates ordered by spreading activation:',
      ...lines
    ].join('\n')
  }
}
