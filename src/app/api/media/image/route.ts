import { getImage } from '@/features/banner/lib/banner.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getImage)
