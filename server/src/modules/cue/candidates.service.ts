import { Injectable } from '@nestjs/common'
import { CANDIDATE_POOL_SIZE, SPREAD_DECAY } from '../../common/constants'
import type { NodeId, ScoredCandidate } from '../../domain/types'
import type { RankCueInput } from './dto/rank-cue.dto'

@Injectable()
export class CandidatesService {
  score(input: RankCueInput): ScoredCandidate[] {
    const { projection, activeNodes, hints } = input

    const activation = new Map<NodeId, number>()
    for (const id of activeNodes) activation.set(id, 1)

    for (let hop = 0; hop < 2; hop++) {
      for (const edge of projection.edges) {
        const from = activation.get(edge.from) ?? 0
        const to = activation.get(edge.to) ?? 0
        if (from > 0) activation.set(edge.to, Math.max(to, from * edge.weight * SPREAD_DECAY))
        if (to > 0) activation.set(edge.from, Math.max(from, to * edge.weight * SPREAD_DECAY))
      }
    }

    const relations = new Map<NodeId, Set<string>>()
    for (const edge of projection.edges) {
      for (const side of [edge.from, edge.to]) {
        const set = relations.get(side) ?? new Set<string>()
        set.add(edge.rel)
        relations.set(side, set)
      }
    }

    return projection.nodes
      .filter(node => node.id !== projection.owner)
      .map(node => {
        const spread = activation.get(node.id) ?? 0
        const kindHint = hints.kind && node.kind === hints.kind ? 0.3 : 0
        const relationHint =
          hints.relation && relations.get(node.id)?.has(hints.relation) ? 0.25 : 0
        const reachable = activeNodes.includes(node.id) ? 0 : 0.05
        return { id: node.id, score: spread + kindHint + relationHint - reachable }
      })
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, CANDIDATE_POOL_SIZE)
  }
}
