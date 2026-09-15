import type {
  CuePlan,
  GraphEdge,
  LadderStep,
  LifeGraph,
  NodeId,
  Provenance,
  StepKind
} from './types'

export const PHONOLOGICAL_CONFIDENCE_GATE = 0.62

const ATTR_KIND: Record<string, StepKind> = {
  family: 'category',
  category: 'category',
  generation: 'relation',
  city: 'place',
  place: 'place',
  region: 'place',
  event: 'relation',
  use: 'use',
  color: 'relation',
  shape: 'shape'
}

function stepKindFor(attr: string): StepKind {
  return ATTR_KIND[attr] ?? 'relation'
}

function firstProvenance(edge: GraphEdge | undefined): Provenance | null {
  return edge?.provenance[0] ?? null
}

export function deterministicPlan(graph: LifeGraph, targetId: NodeId): CuePlan {
  const plans = graph.ladderPlans[targetId] ?? []
  return {
    targetId,
    confidence: 1,
    alternatives: [],
    origin: 'deterministic',
    steps: plans.map((p, i) => ({
      level: i + 1,
      kind: stepKindFor(p.attr),
      attr: p.attr,
      edge: p.edge
    }))
  }
}

export function validatePlan(graph: LifeGraph, plan: CuePlan): boolean {
  const target = graph.nodes[plan.targetId]
  if (!target) return false

  return plan.steps.every(step => {
    if (step.attr in target.attrs === false) return false
    if (step.edge === null) return true
    const edge = graph.edges.find(e => e.id === step.edge)
    if (!edge) return false
    return edge.from === plan.targetId || edge.to === plan.targetId
  })
}

export function buildLadder(graph: LifeGraph, plan: CuePlan): LadderStep[] {
  const target = graph.nodes[plan.targetId]
  if (!target) return []

  const steps: LadderStep[] = plan.steps.map(step => {
    const edge = step.edge ? graph.edges.find(e => e.id === step.edge) : undefined
    return {
      level: step.level,
      kind: step.kind,
      text: target.attrs[step.attr] ?? '',
      edgeId: edge?.id ?? null,
      provenance: firstProvenance(edge),
      isFinal: false
    }
  })

  if (plan.confidence >= PHONOLOGICAL_CONFIDENCE_GATE && target.phon) {
    steps.push({
      level: steps.length + 1,
      kind: 'phonological',
      text: `${target.phon.firstSyllable}…`,
      edgeId: null,
      provenance: null,
      isFinal: true
    })
  }

  return steps
}

export function resolve(graph: LifeGraph, plan: CuePlan): LadderStep[] {
  const safePlan = validatePlan(graph, plan) ? plan : deterministicPlan(graph, plan.targetId)
  return buildLadder(graph, safePlan)
}

export function startingLevel(lastLevel: number | null, totalSteps: number): number {
  if (lastLevel === null) return 1
  return Math.max(1, Math.min(totalSteps, lastLevel - 1))
}
