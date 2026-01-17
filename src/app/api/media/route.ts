import { getUploadUrl } from '@media/lib/media.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const POST = withErrorHandler(getUploadUrl)
