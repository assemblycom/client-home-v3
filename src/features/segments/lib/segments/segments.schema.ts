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
    //IMPORTANT: WE HAVE ADDED A TRIGGER IN THE MIGRATION FILE. THE TRIGGER ENFORCES SAME CUSTOM FIELD ON SEGMENTS: ensure all segments in a workspace share the same custom_field.
    customField: text().notNull(),

    ...timestamps,

    deletedAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (t) => [index('idx_segments__workspace_id').on(t.workspaceId)],
)
