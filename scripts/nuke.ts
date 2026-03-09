import { createClient } from '@supabase/supabase-js'
import { sql } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'

const supabaseUrl = z.url().parse(process.env.SUPABASE_URL)
const supabaseKey = z.string().min(1).parse(process.env.SUPABASE_SECRET_KEY)
const bucketName = z.string().min(1).parse(process.env.SUPABASE_BUCKET_NAME)

const supabase = createClient(supabaseUrl, supabaseKey)

const nukeTables = async () => {
  console.info('Nuking (truncating) all tables... 💣💥')
  await db.execute(sql`TRUNCATE actions, settings, media CASCADE`)
  console.info('All tables nuked 💣💥')
}

const nukeBucket = async () => {
  console.info(`Nuking bucket "${bucketName}"... 💣💥`)

  const listAll = async (path = ''): Promise<string[]> => {
    const { data, error } = await supabase.storage.from(bucketName).list(path, { limit: 1000 })
    if (error) throw error
    if (!data?.length) return []

    const paths: string[] = []

    for (const item of data) {
      const fullPath = path ? `${path}/${item.name}` : item.name

      // NOTE: folders have null metadata, files have non-null metadata
      if (item.metadata === null) {
        paths.push(...(await listAll(fullPath)))
      } else {
        paths.push(fullPath)
      }
    }

    return paths
  }

  const files = await listAll()

  if (files.length === 0) {
    console.info('Bucket is already empty. 💣💥')
    return
  }

  console.info(`Found ${files.length} files. Nuking them... 💣💥`)

  const BATCH_SIZE = 100
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.storage.from(bucketName).remove(batch)
    if (error) throw error
  }

  console.info('Bucket yeeted into oblivion. 💣💥')
}

;(async () => {
  await nukeTables()
  await nukeBucket()
  console.info('--- Nuke complete ---')
})()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
