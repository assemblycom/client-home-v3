import { segments } from '@segments/lib/segments/segments.schema'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '@/db/helpers'

export const conditions = pgTable(
  'conditions',
  {
    id,

    // Parent segment
    segmentId: uuid()
      .references(() => segments.id, { onDelete: 'cascade' })
      .notNull(),

    // The value to compare against the segment's customField
    compareValue: text().notNull(),

    ...timestamps,

    deletedAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (t) => [index('idx_conditions__segment_id').on(t.segmentId)],
)
