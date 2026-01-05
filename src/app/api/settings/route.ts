import { getSettingsWithActions, updateSettingsWithActions } from '@settings/lib/settings-actions.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSettingsWithActions)
export const PATCH = withErrorHandler(updateSettingsWithActions)
