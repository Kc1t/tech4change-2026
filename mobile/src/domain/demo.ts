import type { LifeGraph, NodeId, Resolution } from './types'

const WEEKS = 8
const DAY = 86400000
const RUNGS = 4
const JITTER = [0.4, -0.42, 0.12, -0.46, 0.28, -0.14, 0.44]
const TILT = [-0.3, 0, 0.3]

export function demoHistory(graph: LifeGraph, now: number): Resolution[] {
  const targets = Object.values(graph.nodes)
    .filter(node => node.id !== graph.owner)
    .slice(0, 6)
    .map(node => node.id as NodeId)

  if (targets.length === 0) return []

  const history: Resolution[] = []

  for (let week = 0; week < WEEKS; week++) {
    const pace = week / (WEEKS - 1)
    const expected = RUNGS - pace * (RUNGS - 1)

    for (let slot = 0; slot < 4 + (week % 2); slot++) {
      const index = (week * 5 + slot * 2) % targets.length
      const level = Math.max(
        1,
        Math.min(
          RUNGS,
          Math.round(
            expected + JITTER[(week * 3 + slot) % JITTER.length]! + TILT[index % TILT.length]!
          )
        )
      )

      history.push({
        at: new Date(
          now - (WEEKS - 1 - week) * 7 * DAY + slot * 6 * 3600000 - 2 * DAY
        ).toISOString(),
        targetId: targets[index]!,
        level,
        rungs: RUNGS
      })
    }
  }

  return history.sort((a, b) => a.at.localeCompare(b.at))
}
