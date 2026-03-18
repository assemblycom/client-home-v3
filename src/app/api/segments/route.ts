import { createSegment, deleteAllSegments, getSegments } from '@segments/lib/segments.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSegments)
export const POST = withErrorHandler(createSegment)
export const DELETE = withErrorHandler(deleteAllSegments)
