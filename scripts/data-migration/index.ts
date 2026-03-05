import { migrateMedia } from './media'
import { migrateSettings } from './settings'

async function run() {
  console.info('Migrating settings...')
  await migrateSettings()
  console.info('Migrating media...')
  await migrateMedia()

  console.info('We did it 🔥')
}

;(async () => await run())()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
