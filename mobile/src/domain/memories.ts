import type { EdgeId, LifeGraph, NodeId, ProvenanceSource } from './types'

export interface Memory {
  id: string
  source: ProvenanceSource
  ref: string
  detail: string
  edgeId: EdgeId
  weight: number
  nodes: NodeId[]
}

export function memoriesOf(graph: LifeGraph): Memory[] {
  return graph.edges
    .flatMap(edge =>
      edge.provenance.map((entry, index) => ({
        id: `${edge.id}-${index}`,
        source: entry.source,
        ref: entry.ref,
        detail: entry.detail,
        edgeId: edge.id,
        weight: edge.weight,
        nodes: [edge.from, edge.to]
      }))
    )
    .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
}

export function memoriesAbout(memories: Memory[], id: NodeId): Memory[] {
  return memories.filter(memory => memory.nodes.includes(id))
}

export function memoryTags(graph: LifeGraph, memory: Memory): string[] {
  return memory.nodes
    .filter(id => id !== graph.owner)
    .map(id => graph.nodes[id]?.label)
    .filter((label): label is string => Boolean(label))
}
