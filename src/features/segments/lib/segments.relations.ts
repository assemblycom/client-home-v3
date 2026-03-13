import { conditions } from '@segments/lib/conditions/conditions.schema'
import { segmentConfigs } from '@segments/lib/segment-config/segment-config.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { settings } from '@settings/lib/settings/settings.schema'
import { relations } from 'drizzle-orm'

export const segmentsRelations = relations(segments, ({ many }) => ({
  conditions: many(conditions),
  settings: many(settings),
}))

export const conditionsRelations = relations(conditions, ({ one }) => ({
  segment: one(segments, {
    fields: [conditions.segmentId],
    references: [segments.id],
  }),
}))

export const segmentConfigsRelations = relations(segmentConfigs, () => ({}))
