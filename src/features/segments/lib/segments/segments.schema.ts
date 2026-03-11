import { conditions } from '@segments/lib/conditions/conditions.schema'
import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const segments = pgTable(
  'segments',
  {
    id,
    workspaceId,

    // ID of the user who created the segment
    createdById: uuid().notNull(),

    // Display name of the segment
    name: varchar({ length: 255 }).notNull(),

    // The custom field key this segment evaluates against. All segments in a workspace must share the same customField.
    customField: text().notNull(),

    ...timestamps,

    deletedAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (t) => [index('idx_segments__workspace_id').on(t.workspaceId)],
)

export const segmentsRelations = relations(segments, ({ many }) => ({
  conditions: many(conditions),
}))
