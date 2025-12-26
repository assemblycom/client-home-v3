import type { Actions } from '@settings/lib/actions/actions.entity'
import type { Settings } from '@settings/lib/settings/settings.entity'

export type SettingsWithActions = Settings & { actions: Actions }
