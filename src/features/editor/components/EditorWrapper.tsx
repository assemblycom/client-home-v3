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
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'
import { getActivityMode } from '@/utils/activity'

export function EditorWrapper() {
  const viewMode = useViewStore((store) => store.viewMode)
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const bannerUrl = useSettingsStore((store) => store.bannerUrl)

  useAppControls()

  return (
    <div className="contents">
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div className="tiptap-wrapper @container max-w-full @max-md:rounded-t-none" style={{ backgroundColor }}>
          <Heading />
          <Subheading />
          {bannerUrl ? <Banner src={bannerUrl} alt="Workspace Banner" /> : null}
          <ActionsCard />
          <Editor token={token} content={content} backgroundColor={backgroundColor} />
        </div>
      </Activity>

      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <Preview content={content} token={token} backgroundColor={backgroundColor} />
      </Activity>
    </div>
  )
}
