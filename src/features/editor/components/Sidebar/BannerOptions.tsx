'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Button } from 'copilot-design-system'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'

interface BannerProps {
  onChangeBanner: () => void
}

export const BannerOptions = ({ onChangeBanner }: BannerProps) => {
  const bannerImages = useSettingsStore((store) => store?.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const activeBanner = bannerImages?.find((item) => item.id === bannerId)
  const token = useAuthStore((store) => store.token)

  return (
    <div className="flex flex-col space-y-3">
      {bannerId && <Banner src={getImageUrl(activeBanner?.path, token)} />}

      <Button
        label={`${bannerId ? 'Change' : 'Add'} banner`}
        variant="primary"
        onClick={onChangeBanner}
        className="w-full"
      />
      <Button
        label="Reposition banner"
        variant="secondary"
        onClick={() => console.info('Info: Reposition banner')}
        className="w-full"
      />
    </div>
  )
}
