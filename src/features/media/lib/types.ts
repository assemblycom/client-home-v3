import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { media } from './media.schema'

export const MediaSchema = createSelectSchema(media)

export const MediaCreateSchema = createInsertSchema(media).omit({
  id: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
})
export type MediaCreatePayload = z.infer<typeof MediaCreateSchema>
