import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { deterministicPlan, projectionHash, validatePlan } from '../../domain/projection'
import type { CuePlan } from '../../domain/types'
import { CandidatesService } from './candidates.service'
import type { RankCueInput } from './dto/rank-cue.dto'
import { RerankService } from './rerank.service'

@Injectable()
export class CueService {
  private readonly logger = new Logger(CueService.name)

  constructor(
    private readonly candidates: CandidatesService,
    private readonly rerank: RerankService,
    private readonly prisma: PrismaService
  ) {}

  async rank(input: RankCueInput): Promise<CuePlan> {
    const pool = this.candidates.score(input)
    const fallbackId = pool[0]?.id ?? input.projection.nodes[0]!.id
    const hash = projectionHash(input.projection)

    const fromModel = await this.rerank.rank(input, pool)
    if (fromModel && validatePlan(input.projection, fromModel)) {
      await this.remember(hash, fromModel)
      return fromModel
    }

    const fromCache = await this.recall(hash, fallbackId)
    if (fromCache && validatePlan(input.projection, fromCache)) return fromCache

    return deterministicPlan(input.projection, fallbackId)
  }

  private async remember(hash: string, plan: CuePlan): Promise<void> {
    await this.prisma.cuePlanCache
      .upsert({
        where: { projectionHash_targetId: { projectionHash: hash, targetId: plan.targetId } },
        create: { projectionHash: hash, targetId: plan.targetId, plan: plan as object },
        update: { plan: plan as object }
      })
      .catch(() => this.logger.debug('Cache write skipped'))
  }

  private async recall(hash: string, targetId: string): Promise<CuePlan | null> {
    const row = await this.prisma.cuePlanCache
      .findUnique({ where: { projectionHash_targetId: { projectionHash: hash, targetId } } })
      .catch(() => null)

    return row ? { ...(row.plan as unknown as CuePlan), origin: 'cache' } : null
  }
}
