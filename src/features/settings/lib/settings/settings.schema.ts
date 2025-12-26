import { media } from '@media/lib/media.schema'
import { index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const settings = pgTable(
  'settings',
  {
    id,
    workspaceId,

    // Editor content
    content: text().notNull(),

    // Editor background color
    backgroundColor: varchar({ length: 16 }).notNull().default('#ffffff'),

    // Image id in media table for banner. Multiple settings can point to the same image (default image library)
    bannerImageId: uuid().references(() => media.id),

    ...timestamps,
  },
  (t) => [index('idx_settings__workspace_id').on(t.workspaceId)],
)
