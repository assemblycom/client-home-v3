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
  const { error } = await supabase.storage.emptyBucket(bucketName)
  if (error) throw error
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
