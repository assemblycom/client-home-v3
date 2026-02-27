import { getBannerImages } from '@/features/banner/lib/banner.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getBannerImages)
