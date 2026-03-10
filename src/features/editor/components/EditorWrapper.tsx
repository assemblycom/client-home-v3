'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { Editor } from '@editor/components/Editor'
import { Heading } from '@editor/components/Heading'
import { Preview } from '@editor/components/Preview'
import { Subheading } from '@editor/components/Subheading'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useSettingsMutation } from '@settings/hooks/useSettingsMutation'
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
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const bannerImages = useSettingsStore((store) => store.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const bannerUrl = bannerImages?.find((item) => item.id === bannerId)
  const bannerPositionX = useSettingsStore((store) => store.bannerPositionX) ?? 50
  const bannerPositionY = useSettingsStore((store) => store.bannerPositionY) ?? 50
  const setSidebarView = useSidebarStore((store) => store.setSidebarView)

  const { mutate: updateSettings } = useSettingsMutation()

  const isDark = isDarkColor(backgroundColor)

  useAppControls()

  return (
    <div
      className={cn('w-full grow overflow-x-hidden overflow-y-scroll p-4 @md:p-6', isDark && 'dark', className)}
      style={{ '--bg-color': backgroundColor } as React.CSSProperties}
    >
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div
          className="@container flex min-h-full max-w-full flex-col gap-5 rounded-xl border border-border-gray @max-md:rounded-t-none px-6 py-5"
          style={{ backgroundColor }}
        >
          <div className="flex flex-col gap-1.5">
            <Heading />
            <Subheading />
          </div>
          {bannerUrl ? (
            <Banner
              src={getImageUrl(bannerUrl.path, token)}
              alt="Workspace Banner"
              editable
              positionX={bannerPositionX}
              positionY={bannerPositionY}
              onChangeBanner={() => setSidebarView('change-banner')}
              onSavePosition={(positionX, positionY) =>
                updateSettings({ bannerPositionX: positionX, bannerPositionY: positionY })
              }
            />
          ) : null}
          <ActionsCard />
          <Editor token={token} content={content} />
        </div>
      </Activity>

      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <div className="h-full min-[860px]:px-6 min-[860px]:pt-6.5 min-[860px]:pb-6.5">
          <Preview
            content={content}
            token={token}
            backgroundColor={backgroundColor}
            bannerUrl={getImageUrl(bannerUrl?.path, token)}
            bannerPositionX={bannerPositionX}
            bannerPositionY={bannerPositionY}
          />
        </div>
      </Activity>
    </div>
  )
}
