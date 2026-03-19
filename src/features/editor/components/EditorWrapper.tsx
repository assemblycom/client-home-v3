'use client'

import { Editor } from '@editor/components/Editor'
import { Heading } from '@editor/components/Heading'
import { Preview } from '@editor/components/Preview'
import { Subheading } from '@editor/components/Subheading'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useBannerSettingsMutation } from '@settings/hooks/useBannerSettingsMutation'
import { useSegmentSettings } from '@settings/hooks/useSegmentSettings'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Activity } from 'react'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'
import { useSidebarStore } from '@/features/editor/stores/sidebarStore'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'
import { getActivityMode } from '@/utils/activity'
import { isDarkColor } from '@/utils/color'
import { cn } from '@/utils/tailwind'

interface EditorWrapperProps {
  className?: string
}

export function EditorWrapper({ className }: EditorWrapperProps) {
  const viewMode = useViewStore((store) => store.viewMode)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const bannerImages = useSettingsStore((store) => store.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const bannerUrl = bannerImages?.find((item) => item.id === bannerId)
  const bannerPositionX = useSettingsStore((store) => store.bannerPositionX) ?? 50
  const bannerPositionY = useSettingsStore((store) => store.bannerPositionY) ?? 50
  const setSidebarView = useSidebarStore((store) => store.setSidebarView)
  const bannerRepositioning = useSidebarStore((store) => store.bannerRepositioning)
  const setBannerRepositioning = useSidebarStore((store) => store.setBannerRepositioning)
  const mobileSidebarOpen = useSidebarStore((store) => store.mobileSidebarOpen)
  const toggleMobileSidebar = useSidebarStore((store) => store.toggleMobileSidebar)

  const { mutate: updateBannerSettings } = useBannerSettingsMutation()

  const isDark = isDarkColor(backgroundColor)

  useSegmentSettings()
  useAppControls()

  return (
    <div
      className={cn('w-full grow overflow-x-hidden overflow-y-scroll @md:p-6 p-4', isDark && 'dark', className)}
      style={{ '--bg-color': backgroundColor } as React.CSSProperties}
    >
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div
          className="@container mx-auto flex min-h-full w-full max-w-xl flex-col gap-5 rounded-xl @max-md:rounded-t-none border border-border-gray px-6 py-5"
          style={{ backgroundColor }}
        >
          <div className="flex flex-col gap-1.5">
            <Heading />
            <Subheading />
          </div>
          {bannerUrl && getImageUrl(bannerUrl.path) && (
            <Banner
              src={getImageUrl(bannerUrl.path) ?? ''}
              alt="Workspace Banner"
              editable
              positionX={bannerPositionX}
              positionY={bannerPositionY}
              isRepositioning={bannerRepositioning}
              onRepositioningChange={setBannerRepositioning}
              onChangeBanner={() => {
                setSidebarView('change-banner')
                if (!mobileSidebarOpen && window.innerWidth < 860) toggleMobileSidebar()
              }}
              onSavePosition={(positionX, positionY) =>
                updateBannerSettings({ bannerPositionX: positionX, bannerPositionY: positionY })
              }
            />
          )}
          <ActionsCard />
          <Editor content={content} />
        </div>
      </Activity>

      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <div className="h-full min-[860px]:px-6 min-[860px]:pt-6.5 min-[860px]:pb-6.5">
          <Preview
            content={content}
            backgroundColor={backgroundColor}
            bannerUrl={getImageUrl(bannerUrl?.path)}
            bannerPositionX={bannerPositionX}
            bannerPositionY={bannerPositionY}
          />
        </div>
      </Activity>
    </div>
  )
}
