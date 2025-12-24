import { index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers'
import { media } from '@/db/schema/media.schema'

export const settings = pgTable(
  'settings',
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    workspaceId: varchar({ length: 16 }).notNull(),

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
