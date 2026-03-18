import { upsertSegmentConfig } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const PUT = withErrorHandler(upsertSegmentConfig)
