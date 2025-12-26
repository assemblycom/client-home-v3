import { settings } from '@settings/lib/settings/settings.schema'
import { boolean, index, pgTable, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps, workspaceId } from '@/db/helpers'

export const actions = pgTable(
  'actions',
  {
    id,
    workspaceId,

    settingsId: uuid()
      .references(() => settings.id, { onDelete: 'cascade' })
      .notNull(),

    // Enable showing number of pending invoices in actions banner
    invoices: boolean().notNull().default(false),

    // Enable showing number of pending messages in actions banner
    messages: boolean().notNull().default(false),

    // Enable showing number of pending contracts in actions banner
    contracts: boolean().notNull().default(false),

    // Enable showing number of todo/inProgress tasks in actions banner
    // This field holds value but is only applicable to end-user experience if tasks app is installed in their workspace
    tasks: boolean().notNull().default(false),

    // Enable showing number of pending forms in actions banner
    forms: boolean().notNull().default(false),
    // Do not support Files toggle for now
    // files: boolean().notNull().default(false),

    ...timestamps,
  },
  (t) => [index('idx_actions__workspace_id').on(t.workspaceId), unique('uq_actions__settings_id').on(t.settingsId)],
)
