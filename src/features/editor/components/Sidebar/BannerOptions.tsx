'use client'

import { Button, Toggle } from '@assembly-js/design-system'
import { useBannerSettingsMutation } from '@settings/hooks/useBannerSettingsMutation'
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
  const showGreeting = useSettingsStore((store) => store.showGreeting)
  const activeBanner = bannerImages?.find((item) => item.id === bannerId)
  const setBannerRepositioning = useSidebarStore((store) => store.setBannerRepositioning)
  const mobileSidebarOpen = useSidebarStore((store) => store.mobileSidebarOpen)
  const toggleMobileSidebar = useSidebarStore((store) => store.toggleMobileSidebar)

  const { mutate: updateBannerSettings } = useBannerSettingsMutation()

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-primary">Show greeting</span>
        <Toggle
          label=""
          checked={showGreeting}
          onChange={(e) => updateBannerSettings({ showGreeting: e.target.checked })}
        />
      </div>

      {bannerId && getImageUrl(activeBanner?.path) && <Banner src={getImageUrl(activeBanner?.path) ?? ''} />}

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
