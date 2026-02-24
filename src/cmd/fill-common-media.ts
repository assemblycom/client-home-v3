/* eslint-disable no-console */
/**
 * Script to populate the media table with common files (e.g. banner images)
 * that are shared across all workspaces.
 *
 * Files are read from the 'media/common' folder in the Supabase bucket.
 * Each record is inserted with workspaceId = '*' to indicate it is global.
 *
 * Usage (uses the project's `ex` script which handles dotenv + path aliases):
 *   pnpm ex src/cmd/fill-common-media.ts
 */

import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { media } from '@/features/media/lib/media.schema'

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const SUPABASE_URL = getRequiredEnv('SUPABASE_URL')
const SUPABASE_SECRET_KEY = getRequiredEnv('SUPABASE_SECRET_KEY')
const SUPABASE_BUCKET_NAME = getRequiredEnv('SUPABASE_BUCKET_NAME')
const DATABASE_URL = getRequiredEnv('DATABASE_URL')

const COMMON_MEDIA_FOLDER = 'common'
const WORKSPACE_ID = '*'
const CREATED_BY_ID = 'e68de80f-70c6-4b05-9641-020c8a6814c0'

const run = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)
  const sql = postgres(DATABASE_URL, { prepare: false })
  const db = drizzle(sql, { casing: 'snake_case' })

  console.info(`🔍 Listing files in bucket '${SUPABASE_BUCKET_NAME}/${COMMON_MEDIA_FOLDER}'...`)

  const { data: files, error: listError } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .list(COMMON_MEDIA_FOLDER, { limit: 1000 })

  if (listError) {
    console.error('❌ Failed to list files from Supabase storage:', listError.message)
    await sql.end()
    process.exit(1)
  }

  if (!files || files.length === 0) {
    console.info('⚠️  No files found in media/common. Nothing to insert.')
    await sql.end()
    return
  }

  const realFiles = files.filter((f) => f.id !== null && f.metadata !== null)

  console.info(`📂 Found ${realFiles.length} file(s). Inserting into media table...\n`)

  let inserted = 0
  let skipped = 0

  for (const file of realFiles) {
    const path = `${COMMON_MEDIA_FOLDER}/${file.name}`
    const name = file.name
    const type: string = file.metadata?.mimetype ?? 'application/octet-stream'
    const size: string = file.metadata?.size ?? 0

    try {
      await db
        .insert(media)
        .values({
          workspaceId: WORKSPACE_ID,
          createdById: CREATED_BY_ID,
          name,
          path,
          type,
          size,
        })
        .onConflictDoNothing()

      console.info(`  ✅ Inserted: ${path} (${type}, ${size})`)
      inserted++
    } catch (err) {
      console.error(`  ❌ Failed to insert '${path}':`, err)
      skipped++
    }
  }

  console.info(`\n🎉 Done! ${inserted} inserted, ${skipped} failed.`)

  await sql.end()
}

run().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
