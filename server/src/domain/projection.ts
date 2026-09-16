import { createHash } from 'crypto'
import type {
  CuePlan,
  EdgeId,
  GraphProjection,
  NodeId,
  ProjectedEdge,
  ProjectedNode,
  StepKind
} from './types'

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

const LADDER_ORDER = ['family', 'category', 'generation', 'region', 'city', 'place', 'use', 'shape', 'color', 'event']

export function stepKindFor(attr: string): StepKind {
  return ATTR_KIND[attr] ?? 'relation'
}

export function projectionHash(projection: GraphProjection): string {
  const stable = JSON.stringify({
    owner: projection.owner,
    nodes: [...projection.nodes]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(n => [n.id, n.kind, [...n.attrKeys].sort(), n.hasPhonology]),
    edges: [...projection.edges]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(e => [e.id, e.from, e.to, e.rel, e.weight])
  })
  return createHash('sha256').update(stable).digest('hex').slice(0, 32)
}

export function indexNodes(projection: GraphProjection): Map<NodeId, ProjectedNode> {
  return new Map(projection.nodes.map(node => [node.id, node]))
}

export function edgesOf(projection: GraphProjection, id: NodeId): ProjectedEdge[] {
  return projection.edges.filter(edge => edge.from === id || edge.to === id)
}

export function deterministicPlan(projection: GraphProjection, targetId: NodeId): CuePlan {
  const node = indexNodes(projection).get(targetId)
  const attrs = node ? [...node.attrKeys] : []
  const ordered = attrs.sort((a, b) => {
    const ia = LADDER_ORDER.indexOf(a)
    const ib = LADDER_ORDER.indexOf(b)
    return (ia === -1 ? LADDER_ORDER.length : ia) - (ib === -1 ? LADDER_ORDER.length : ib)
  })
  const linked = edgesOf(projection, targetId)

  return {
    targetId,
    confidence: 1,
    alternatives: [],
    origin: 'deterministic',
    steps: ordered.map((attr, i) => ({
      level: i + 1,
      kind: stepKindFor(attr),
      attr,
      edge: linked[Math.min(i, Math.max(0, linked.length - 1))]?.id ?? null
    }))
  }
}

export function validatePlan(projection: GraphProjection, plan: CuePlan): boolean {
  const node = indexNodes(projection).get(plan.targetId)
  if (!node) return false
  if (plan.steps.length === 0) return false

  const byId = new Map<EdgeId, ProjectedEdge>(projection.edges.map(edge => [edge.id, edge]))

  return plan.steps.every(step => {
    if (!node.attrKeys.includes(step.attr)) return false
    if (step.edge === null) return true
    const edge = byId.get(step.edge)
    if (!edge) return false
    return edge.from === plan.targetId || edge.to === plan.targetId
  })
}
