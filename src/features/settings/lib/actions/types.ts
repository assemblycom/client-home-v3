import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type z from 'zod'
import { actions } from './actions.schema'

export const ActionsSchema = createSelectSchema(actions)

export const ActionsCreateSchema = createInsertSchema(actions).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type ActionsCreatePayload = z.infer<typeof ActionsCreateSchema>

export const ActionsUpdateSchema = createUpdateSchema(actions).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type ActionsUpdatePayload = z.infer<typeof ActionsUpdateSchema>
