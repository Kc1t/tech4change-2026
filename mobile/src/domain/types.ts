export type NodeId = string
export type EdgeId = string

export type NodeKind = 'person' | 'place' | 'object' | 'event' | 'animal'

export type Mastery = 'unseen' | 'low' | 'medium' | 'high'

export type ProvenanceSource = 'photo' | 'audio' | 'message' | 'family'

export interface Provenance {
  source: ProvenanceSource
  ref: string
  detail: string
}

export interface Phonology {
  syllables: string[]
  firstSyllable: string
}

export interface GraphNode {
  id: NodeId
  label: string
  kind: NodeKind
  aliases?: string[]
  attrs: Record<string, string>
  phon?: Phonology
  layout: { x: number; y: number }
}

export interface GraphEdge {
  id: EdgeId
  from: NodeId
  to: NodeId
  rel: string
  weight: number
  provenance: Provenance[]
}

export interface LifeGraph {
  owner: NodeId
  nodes: Record<NodeId, GraphNode>
  edges: GraphEdge[]
  ladderPlans: Record<NodeId, LadderPlan[]>
}

export interface LadderPlan {
  attr: string
  edge: EdgeId
}

export type StepKind = 'category' | 'relation' | 'place' | 'use' | 'shape' | 'phonological'

export interface LadderStep {
  level: number
  kind: StepKind
  attr: string
  text: string
  edgeId: EdgeId | null
  provenance: Provenance | null
  isFinal: boolean
}

export interface CuePlan {
  targetId: NodeId
  confidence: number
  alternatives: NodeId[]
  steps: Array<{ level: number; kind: StepKind; attr: string; edge: EdgeId | null }>
  origin: 'model' | 'cache' | 'deterministic'
}

export interface LearningState {
  lastLevel: number | null
  successes: number
  failures: number
  lastSeen: string | null
  nextReview: string | null
  mastery: Mastery
}

export interface Resolution {
  at: string
  targetId: NodeId
  level: number
  rungs: number
}

export type DiscretionMode = 'discreet' | 'normal' | 'home'

export type HelpLevel = 'deliver' | 'hint' | 'ladder'

export type OutputMode = 'voice' | 'text' | 'both'
export type Backdrop = 'wave' | 'orb'

export interface ChannelState {
  phone: boolean
  earbuds: boolean
  watch: boolean
}

export interface Scene {
  targetId: NodeId
  speaker: string
  prompt: string
  attempt: string
}

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

export interface ClinicianSummary {
  subject: string
  attempts: number
  averageLevel: number | null
  blocks: number
  trend: Array<{ week: number; averageLevel: number; attempts: number }>
  targets: Array<{
    targetId: NodeId
    averageLevel: number
    attempts: number
    state: 'unaided' | 'one_rung' | 'full_ladder'
  }>
}
