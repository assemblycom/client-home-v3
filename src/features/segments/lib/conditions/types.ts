import { conditions } from '@segments/lib/conditions/conditions.schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'

export const ConditionSchema = createSelectSchema(conditions)

export const ConditionCreateSchema = createInsertSchema(conditions).omit({
  id: true,
  segmentId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})
export type ConditionCreatePayload = z.infer<typeof ConditionCreateSchema>
