/**
 * Backfill script to replace <image-resizer> tags with <img> tags in settings content.
 *
 * The old app used a custom <image-resizer> element. The new app's TipTap Image extension
 * only parses <img> tags. This script queries for affected rows and performs the replacement.
 *
 * Key transformation:
 *   <image-resizer width="100%" height="0" src="..."></image-resizer>
 *   → <img width="100%" src="...">
 *
 * height="0" and height="auto" are stripped because they were used by the old component
 * to mean "unset" but on a native <img> tag, height="0" collapses the image to 0px.
 *
 * Usage:
 *   pnpm ex src/cmd/backfill-image-resizer.ts
 */

import { settings } from '@settings/lib/settings/settings.schema'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const DATABASE_URL = getRequiredEnv('DATABASE_URL')

const migrateImageResizerToImg = (content: string): string =>
  content
    // Remove height="0" or height="auto" attributes (these meant "unset" in the old component)
    .replace(/<image-resizer\b([^>]*)\sheight="(0|auto)"([^>]*)>/g, '<image-resizer$1$3>')
    // Replace opening <image-resizer to <img
    .replace(/<image-resizer\b/g, '<img')
    // Remove closing </image-resizer> (img is a void element)
    .replace(/<\/image-resizer>/g, '')

const run = async () => {
  const sqlClient = postgres(DATABASE_URL, { prepare: false })
  const db = drizzle(sqlClient, { casing: 'snake_case' })

  console.info('🔍 Querying for settings with <image-resizer> tags...')

  const affected = await db
    .select({ id: settings.id, workspaceId: settings.workspaceId, content: settings.content })
    .from(settings)
    .where(sql`${settings.content} LIKE '%image-resizer%'`)

  console.info(`📂 Found ${affected.length} row(s) to update.\n`)

  if (affected.length === 0) {
    await sqlClient.end()
    return
  }

  let updated = 0
  let failed = 0

  for (const row of affected) {
    const newContent = migrateImageResizerToImg(row.content)

    if (newContent === row.content) {
      console.info(`  ⏭️  ${row.id} (workspace: ${row.workspaceId}) — no change after transform, skipping`)
      continue
    }

    try {
      await db.update(settings).set({ content: newContent }).where(eq(settings.id, row.id))
      console.info(`  ✅ ${row.id} (workspace: ${row.workspaceId}) — updated`)
      updated++
    } catch (err) {
      console.error(`  ❌ ${row.id} (workspace: ${row.workspaceId}) — failed:`, err)
      failed++
    }
  }

  console.info(`\n🎉 Done! ${updated} updated, ${failed} failed.`)

  await sqlClient.end()
}

run().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
