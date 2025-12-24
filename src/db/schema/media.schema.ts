import { index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers'

export const media = pgTable(
  'media',
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    workspaceId: varchar({ length: 16 }).notNull(),

    // ID of internal user that uploaded the image
    createdById: uuid().notNull(),

    // Image name
    name: varchar({ length: 1028 }).notNull(),
    // Path inside Supabase bucket for file. Typically is /{workspaceId}/{imageName}
    path: varchar({ length: 1028 }).notNull(),

    // Alt text for image (optional)
    alt: varchar({ length: 1028 }),
    // File type
    type: varchar({ length: 1028 }).notNull(),
    // File size
    size: varchar({ length: 1028 }).notNull(),

    ...timestamps,
  },
  (t) => [index('idx_media__workspace_id').on(t.workspaceId)],
)
