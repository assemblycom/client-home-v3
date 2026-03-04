import { getBannerImages, insertBannerImage } from '@/features/banner/lib/banner.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getBannerImages)
export const POST = withErrorHandler(insertBannerImage)
