import { index, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const mediaTypeEnum = pgEnum('media_type', ['banner', 'media'])

export const media = pgTable(
  'media',
  {
    id,
    workspaceId,

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

    // Type of media (banner or media)
    mediaType: mediaTypeEnum().notNull().default('media'),

    ...timestamps,
  },
  (t) => [index('idx_media__workspace_id').on(t.workspaceId)],
)
