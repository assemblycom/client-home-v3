'use client'

import { useSettingsStore } from '@settings/providers/settings.provider'
import { useEffect } from 'react'
import type { BannerImagesResponse } from '@/features/banner/types'

interface BannerImagesSetterProps {
  bannerImages: BannerImagesResponse
}

export const BannerImagesSetter = ({ bannerImages }: BannerImagesSetterProps) => {
  const setBannerImages = useSettingsStore((state) => state.setBannerImages)

  useEffect(() => {
    setBannerImages(bannerImages)
  }, [bannerImages, setBannerImages])

  return null
}
