import { getSignedUrl, getUploadUrl } from '@media/lib/media.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getSignedUrl)
export const POST = withErrorHandler(getUploadUrl)
