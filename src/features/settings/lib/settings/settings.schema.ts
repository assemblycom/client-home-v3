import { media } from '@media/lib/media.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { boolean, index, integer, pgTable, text, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import type z from 'zod'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const settings = pgTable(
  'settings',
  {
    id,
    workspaceId,

    // Optional segment association. Null means default (non-segmented) settings.
    segmentId: uuid().references(() => segments.id, { onDelete: 'cascade' }),

    // Heading (greeting) text section. Stores HTML so it can contain autofill fields.
    heading: text()
      .notNull()
      .default('<p>Welcome, <autofill-field data-value="{{client.firstName}}"></autofill-field></p>'),

    // Subheading text section. Stores HTML so it can contain autofill fields.
    subheading: text().notNull().default("Here's what needs your attention today"),

    // Editor content
    content: text().notNull(),

    // Editor background color
    backgroundColor: varchar({ length: 16 }).notNull().default('#ffffff'),

    // Image id in media table for banner. Multiple settings can point to the same image (default image library)
    bannerImageId: uuid().references(() => media.id),

    // X/Y position of the banner image as a percentage (0-100), used for repositioning
    bannerPositionX: integer('banner_position_x').notNull().default(50),
    bannerPositionY: integer('banner_position_y').notNull().default(50),

    // Whether to show the heading/subheading (greeting) section above the banner
    showGreeting: boolean().notNull().default(true),

    // ID of IU who created the settings
    createdById: uuid(),

    ...timestamps,
  },
  (t) => [
    index('idx_settings__workspace_id').on(t.workspaceId),
    unique('uq_settings__workspace_id_segment_id').on(t.workspaceId, t.segmentId),
  ],
)

export const SettingsInsertPayloadSchema = createInsertSchema(settings)
export type SettingsInsertPayload = z.infer<typeof SettingsInsertPayloadSchema>
