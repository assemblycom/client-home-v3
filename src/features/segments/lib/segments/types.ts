import { segments } from '@segments/lib/segments/segments.schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'

export const SegmentSchema = createSelectSchema(segments)

export const SegmentCreateSchema = createInsertSchema(segments).omit({
  id: true,
  workspaceId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
})
export type SegmentCreatePayload = z.infer<typeof SegmentCreateSchema>
