'use client'

import { Button } from '@assembly-js/design-system'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'
import { useSidebarStore } from '@/features/editor/stores/sidebarStore'

interface BannerProps {
  onChangeBanner: () => void
}

export const BannerOptions = ({ onChangeBanner }: BannerProps) => {
  const bannerImages = useSettingsStore((store) => store?.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const activeBanner = bannerImages?.find((item) => item.id === bannerId)
  const token = useAuthStore((store) => store.token)
  const setBannerRepositioning = useSidebarStore((store) => store.setBannerRepositioning)
  const mobileSidebarOpen = useSidebarStore((store) => store.mobileSidebarOpen)
  const toggleMobileSidebar = useSidebarStore((store) => store.toggleMobileSidebar)

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
        onClick={() => {
          setBannerRepositioning(true)
          if (mobileSidebarOpen) toggleMobileSidebar()
        }}
        className="w-full"
      />
    </div>
  )
}
