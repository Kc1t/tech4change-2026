export type NodeId = string
export type EdgeId = string
export type SubjectId = string

export type NodeKind = 'person' | 'place' | 'object' | 'event' | 'animal'

export type StepKind = 'category' | 'relation' | 'place' | 'use' | 'shape' | 'phonological'

export type PlanOrigin = 'model' | 'cache' | 'deterministic'

export interface ProjectedNode {
  id: NodeId
  kind: NodeKind
  attrKeys: string[]
  hasPhonology: boolean
}

export interface ProjectedEdge {
  id: EdgeId
  from: NodeId
  to: NodeId
  rel: string
  weight: number
}

export interface GraphProjection {
  owner: NodeId
  nodes: ProjectedNode[]
  edges: ProjectedEdge[]
}

export interface PlanStep {
  level: number
  kind: StepKind
  attr: string
  edge: EdgeId | null
}

export interface CuePlan {
  targetId: NodeId
  confidence: number
  alternatives: NodeId[]
  steps: PlanStep[]
  origin: PlanOrigin
}

export interface ScoredCandidate {
  id: NodeId
  score: number
}
