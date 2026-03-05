import { settings } from '@settings/lib/settings/settings.schema'
import { createClient } from '@supabase/supabase-js'
import { get } from '@vercel/blob'
import { eq, sql } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { oldDb } from './config'

type OldMedia = {
  id: string
  url: string
  filename: string
  contentType: string
  size: number
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

const supabaseUrl = z.url().parse(process.env.SUPABASE_URL)
const supabaseKey = z.string().min(1).parse(process.env.SUPABASE_SECRET_KEY)
const bucketName = z.string().min(1).parse(process.env.SUPABASE_BUCKET_NAME)

const supabase = createClient(supabaseUrl, supabaseKey)

const getFilenameFromUrl = (url: string) => {
  const pathname = new URL(url).pathname
  return z.string().min(1).parse(pathname.split('/').pop())
}

export const migrateMedia = async () => {
  const oldMedia = (await oldDb.execute(
    sql`
      SELECT
        m.id,
        m.url,
        m.filename,
        m."contentType",
        m.size,
        s."workspaceId",
        m."createdById",
        m."createdAt",
        m."updatedAt"
      FROM "Media" m
      JOIN "Setting" s ON s."bannerImageId" = m."id"
      `,
  )) as OldMedia[]

  const BATCH_SIZE = 100

  for (let i = 0; i < oldMedia.length; i += BATCH_SIZE) {
    const batch = oldMedia.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (oldFile) => {
        const filename = getFilenameFromUrl(oldFile.url)
        const toPath = `${oldFile.workspaceId}/banner/${filename}`

        const { data: existing } = await supabase.storage.from(bucketName).list(`${oldFile.workspaceId}/banner`, {
          search: filename,
          limit: 1,
        })

        if (!existing?.some((f) => f.name === filename)) {
          const blob = await get(oldFile.url, { access: 'private' })
          if (!blob) {
            console.error('Failed to get blob', oldFile.url)
            return
          }

          const buffer = Buffer.from(await new Response(blob.stream).arrayBuffer())

          const { error } = await supabase.storage.from(bucketName).upload(toPath, buffer, {
            contentType: oldFile.contentType,
          })

          if (error) {
            console.error(`Failed to upload ${toPath}: ${error.message}`)
            return
          }
        } else {
          console.warn(`Skipping upload, already exists: ${toPath}`)
          return
        }

        await db.transaction(async (tx) => {
          await tx.execute(sql`
          INSERT INTO media (id, workspace_id, name, path, type, size, media_type, created_by_id, created_at, updated_at)
          VALUES (
            ${oldFile.id}::uuid,
            ${oldFile.workspaceId},
            ${oldFile.filename},
            ${toPath},
            ${oldFile.contentType},
            ${String(oldFile.size)},
            'banner',
            ${oldFile.createdById}::uuid,
            ${oldFile.createdAt}::timestamptz,
            ${oldFile.updatedAt}::timestamptz
          )
        `)
          // This won't work after segments. Let's make this work before then otherwise we're fucked
          await tx
            .update(settings)
            .set({ bannerImageId: oldFile.id })
            .where(eq(settings.workspaceId, oldFile.workspaceId))
        })
        console.info(`Migrated ${toPath}`)
      }),
    )

    console.info(`Batch ${i / BATCH_SIZE + 1} done (${Math.min(i + BATCH_SIZE, oldMedia.length)}/${oldMedia.length})`)
  }
}
