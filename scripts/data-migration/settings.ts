import { defaultContent } from '@settings/constants'
import { actions } from '@settings/lib/actions/actions.schema'
import { type SettingsInsertPayload, settings } from '@settings/lib/settings/settings.schema'
import { sql } from 'drizzle-orm'
import db from '@/db'
import { oldDb } from './config'

type OldSettings = {
  id: string
  workspaceId: string
  backgroundColor: string
  content: string
  createdById: string
  createdAt: string
  updatedAt: string
  notifications: Array<{ key: 'billing' | 'forms' | 'contracts' | 'tasks'; show: boolean; order: number }>
}

const stripNotificationWidget = (content: string) =>
  content.replace(/<notification_widget>[\s\S]*?<\/notification_widget>/g, '')

const migrateIframeToEmbed = (content: string) =>
  content.replace(/<iframe\b/g, '<embed').replace(/<\/iframe>/g, '</embed>')

const notificationKeyMap: Record<string, string> = {
  billing: 'invoices',
  forms: 'forms',
  contracts: 'contracts',
  tasks: 'tasks',
}

export const migrateSettings = async () => {
  const oldSettings = (await oldDb.execute(
    sql`
      SELECT
        id,
        "workspaceId",
        "backgroundColor",
        content,
        notifications,
        "createdById",
        "createdAt",
        "updatedAt"
      FROM "Setting"
      -- LIMIT 10
      `,
  )) as OldSettings[]

  const migrationSettings = oldSettings.map(
    (setting) =>
      ({
        id: setting.id,
        workspaceId: setting.workspaceId,
        backgroundColor: setting.backgroundColor,
        subheading: "Here's what needs your attention today",
        content: migrateIframeToEmbed(stripNotificationWidget(setting.content)) || defaultContent,
        createdById: setting.createdById,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt),
      }) satisfies SettingsInsertPayload,
  )

  // console.dir(
  //   migrationSettings.filter((s) => s.backgroundColor.length > 16),
  //   { depth: Infinity },
  // )
  console.info(`Migrating ${migrationSettings.length} settings to new DB...`)
  await db.insert(settings).values(migrationSettings).onConflictDoNothing()

  const migrationActions = oldSettings.map((setting) => {
    const notifications = Array.isArray(setting.notifications) ? setting.notifications : []
    const sorted = [...notifications].sort((a, b) => a.order - b.order)
    const order = sorted.map((n) => notificationKeyMap[n.key]).filter(Boolean)

    const enabled = Object.fromEntries(notifications.map((n) => [notificationKeyMap[n.key], n.show]))

    return {
      workspaceId: setting.workspaceId,
      settingsId: setting.id,
      invoices: enabled.invoices ?? false,
      contracts: enabled.contracts ?? false,
      tasks: enabled.tasks ?? false,
      forms: enabled.forms ?? false,
      order,
    }
  })

  console.info(`Migrating ${migrationActions.length} actions to new DB...`)
  await db.insert(actions).values(migrationActions).onConflictDoNothing()
}
