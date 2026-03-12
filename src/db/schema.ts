import { conditions } from '@segments/lib/conditions/conditions.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { conditionsRelations, segmentsRelations } from '@segments/lib/segments.relations'
import { settingsRelations } from '@settings/lib/settings/settings.relations'
import { settings } from '@settings/lib/settings/settings.schema'

// Add schema here when you want to use the relational API
export const schema = {
  segments,
  segmentsRelations,
  conditions,
  conditionsRelations,
  settings,
  settingsRelations,
}
