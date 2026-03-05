'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { Editor } from '@editor/components/Editor'
import { Heading } from '@editor/components/Heading'
import { Preview } from '@editor/components/Preview'
import { Subheading } from '@editor/components/Subheading'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Activity } from 'react'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'
import { getActivityMode } from '@/utils/activity'

export function EditorWrapper() {
  const viewMode = useViewStore((store) => store.viewMode)
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const bannerImages = useSettingsStore((store) => store.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const bannerUrl = bannerImages?.find((item) => item.id === bannerId)

  useAppControls()

  return (
    <div
      className="w-full grow overflow-x-hidden overflow-y-scroll @md:px-6 @md:pt-6.5 pb-6.5"
      style={{ backgroundColor }}
    >
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div className="flex max-w-full flex-col gap-5 @max-md:rounded-t-none" style={{ backgroundColor }}>
          <Heading />
          <Subheading />
          {bannerUrl ? (
            <Banner src={getImageUrl(bannerUrl.path, token)} alt="Workspace Banner" className="my-6" />
          ) : null}
          <ActionsCard />
          <Editor token={token} content={content} backgroundColor={backgroundColor} />
        </div>
      </Activity>

      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <Preview
          content={content}
          token={token}
          backgroundColor={backgroundColor}
          bannerUrl={getImageUrl(bannerUrl?.path, token)}
        />
      </Activity>
    </div>
  )
}
