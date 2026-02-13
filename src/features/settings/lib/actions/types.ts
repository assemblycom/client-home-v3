import { actions } from '@settings/lib/actions/actions.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'

const orderSchema = z.array(z.string())

export const ActionsSchema = createSelectSchema(actions, {
  order: orderSchema,
})

export const ActionsCreateSchema = createInsertSchema(actions, {
  order: orderSchema.optional(),
}).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type ActionsCreatePayload = z.infer<typeof ActionsCreateSchema>

export const ActionsUpdateSchema = createUpdateSchema(actions, {
  order: orderSchema.optional(),
}).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type ActionsUpdatePayload = z.infer<typeof ActionsUpdateSchema>
