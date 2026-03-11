import { getSegmentStats } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSegmentStats)
