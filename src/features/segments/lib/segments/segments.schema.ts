import { index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
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

    ...timestamps,
  },
  (t) => [index('idx_segments__workspace_id').on(t.workspaceId)],
)
