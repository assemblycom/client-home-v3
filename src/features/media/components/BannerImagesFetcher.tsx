import env from '@/config/env'
import type { BannerImagesResponse } from '@/features/banner/types'
import { api } from '@/lib/core/axios.instance'
import { BannerImagesSetter } from './BannerImagesSetter'

interface BannerImagesFetcherProps {
  token: string
}

export const BannerImagesFetcher = async ({ token }: BannerImagesFetcherProps) => {
  const { data } = await api.get<{ data: BannerImagesResponse }>(
    `${env.VERCEL_URL}/api/media/banner-images?token=${token}`,
  )
  return <BannerImagesSetter bannerImages={data.data} />
}
