import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const OPAQUE_ID = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_:-]*$/, 'identifiers must be opaque: lowercase, digits, _ : - only')

const ATTR_KEY = z.string().min(1).max(32).regex(/^[a-z][a-z0-9_]*$/)

const ProjectedNodeSchema = z.object({
  id: OPAQUE_ID,
  kind: z.enum(['person', 'place', 'object', 'event', 'animal']),
  attrKeys: z.array(ATTR_KEY).max(24),
  hasPhonology: z.boolean()
})

const ProjectedEdgeSchema = z.object({
  id: OPAQUE_ID,
  from: OPAQUE_ID,
  to: OPAQUE_ID,
  rel: ATTR_KEY,
  weight: z.number().min(0).max(1)
})

const GraphProjectionSchema = z.object({
  owner: OPAQUE_ID,
  nodes: z.array(ProjectedNodeSchema).min(1).max(2000),
  edges: z.array(ProjectedEdgeSchema).max(8000)
})

const RankCueSchema = z.object({
  subject: OPAQUE_ID,
  projection: GraphProjectionSchema,
  activeNodes: z.array(OPAQUE_ID).max(32).default([]),
  hints: z
    .object({
      kind: z.enum(['person', 'place', 'object', 'event', 'animal']).optional(),
      relation: ATTR_KEY.optional()
    })
    .default({}),
  lastLevel: z.number().int().min(0).max(12).nullable().default(null)
})

export class RankCueDto extends createZodDto(RankCueSchema) {}
export type RankCueInput = z.infer<typeof RankCueSchema>
