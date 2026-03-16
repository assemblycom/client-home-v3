import type { Condition } from '@segments/lib/conditions/conditions.entity'
import type { Segment } from '@segments/lib/segments/segments.entity'
import { settings } from '@settings/lib/settings/settings.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type z from 'zod'

export const SettingsSchema = createSelectSchema(settings)

export const SettingsCreateSchema = createInsertSchema(settings).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type SettingsCreatePayload = z.infer<typeof SettingsCreateSchema>

export const SettingsUpdateSchema = createUpdateSchema(settings).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type SettingsUpdatePayload = z.infer<typeof SettingsUpdateSchema>

export type SegmentWithConditions = Segment & {
  conditions: Condition[]
}

export type SettingsWithSegment = Pick<z.infer<typeof SettingsSchema>, 'id' | 'workspaceId' | 'segmentId'> & {
  segment: SegmentWithConditions | null
}
