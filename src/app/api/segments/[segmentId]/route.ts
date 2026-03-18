import { deleteSegment, updateSegment } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const PATCH = withErrorHandler(updateSegment)
export const DELETE = withErrorHandler(deleteSegment)
