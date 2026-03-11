import { conditions } from '@segments/lib/conditions/conditions.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { relations } from 'drizzle-orm'

export const segmentsRelations = relations(segments, ({ many }) => ({
  conditions: many(conditions),
}))

export const conditionsRelations = relations(conditions, ({ one }) => ({
  segment: one(segments, {
    fields: [conditions.segmentId],
    references: [segments.id],
  }),
}))
