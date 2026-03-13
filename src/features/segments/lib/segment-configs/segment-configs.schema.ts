import { pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const customFieldEntityTypeEnum = pgEnum('custom_field_entity_type', ['client', 'company'])

export const segmentConfigs = pgTable(
  'segment_configs',
  {
    id,
    workspaceId,

    // The custom field key this workspace's segments evaluate against
    customField: text().notNull(),

    // Assembly API custom field ID
    customFieldId: text().notNull(),

    // Whether the custom field belongs to a client or company entity
    entityType: customFieldEntityTypeEnum().notNull().default('client'),

    ...timestamps,
  },
  (t) => [uniqueIndex('uq_segment_configs__workspace_id').on(t.workspaceId)],
)
