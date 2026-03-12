import { deleteSegment, getSegment, updateSegment } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSegment)
export const PATCH = withErrorHandler(updateSegment)
export const DELETE = withErrorHandler(deleteSegment)
