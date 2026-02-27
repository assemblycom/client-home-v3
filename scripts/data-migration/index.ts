// Steps:
// 1. Move actions to new actions table
// 2. Move media blobs to new supabase store
// 3. Move media to new medias table
// 4. Move settings to new settings table

import { migrateSettings } from './settings'

async function run() {
  await migrateSettings()
}

;(async () => await run())()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
