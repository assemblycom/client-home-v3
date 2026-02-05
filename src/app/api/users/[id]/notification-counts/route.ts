import { getAllUserNotificationCounts } from '@notification-counts/lib/notification-counts.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getAllUserNotificationCounts)
