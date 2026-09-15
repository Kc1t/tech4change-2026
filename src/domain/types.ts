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

export type DiscretionMode = 'discreet' | 'normal' | 'home'

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
