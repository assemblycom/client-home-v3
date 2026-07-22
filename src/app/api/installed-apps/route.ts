import { getActionableInstalls } from '@installed-apps/lib/installed-apps.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getActionableInstalls)
