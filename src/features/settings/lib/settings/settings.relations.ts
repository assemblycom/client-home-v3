import { segments } from '@segments/lib/segments/segments.schema'
import { settings } from '@settings/lib/settings/settings.schema'
import { relations } from 'drizzle-orm'

export const settingsRelations = relations(settings, ({ one }) => ({
  segment: one(segments, {
    fields: [settings.segmentId],
    references: [segments.id],
  }),
}))
