import { getSettings } from '@settings/lib/settings.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSettings)
