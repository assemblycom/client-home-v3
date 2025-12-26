import { getSettingsWithActions } from '@settings/lib/settings-actions.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSettingsWithActions)
