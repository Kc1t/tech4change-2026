import type { GraphProjection, LifeGraph } from './types'

export function project(graph: LifeGraph): GraphProjection {
  return {
    owner: graph.owner,
    nodes: Object.values(graph.nodes).map(node => ({
      id: node.id,
      kind: node.kind,
      attrKeys: Object.keys(node.attrs),
      hasPhonology: Boolean(node.phon)
    })),
    edges: graph.edges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      rel: edge.rel,
      weight: edge.weight
    }))
  }
}
