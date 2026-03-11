import { createSegment } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const POST = withErrorHandler(createSegment)
