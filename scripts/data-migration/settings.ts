import { defaultContent } from '@settings/constants'
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
}

export const migrateSettings = async () => {
  const oldSettings = (await oldDb.execute(
    sql`
      SELECT 
        id,
        "workspaceId",
        "backgroundColor",
        content,
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
        content: setting.content || defaultContent,
        createdById: setting.createdById,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt),
      }) satisfies SettingsInsertPayload,
  )

  // console.dir(
  //   migrationSettings.filter((s) => s.backgroundColor.length > 16),
  //   { depth: Infinity },
  // )
  await db.insert(settings).values(migrationSettings).onConflictDoNothing()
}
