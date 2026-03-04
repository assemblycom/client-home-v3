import { getImage } from '@/features/media/lib/media.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getImage)
