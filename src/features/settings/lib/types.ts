import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type z from 'zod'
import { settings } from '@/features/settings/lib/settings.schema'

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
