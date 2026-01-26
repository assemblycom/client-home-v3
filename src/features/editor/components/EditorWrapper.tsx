'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { Editor } from '@editor/components/Editor'
import { Preview } from '@editor/components/Preview'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Activity } from 'react'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'

export function EditorWrapper() {
  const viewMode = useViewStore((store) => store.viewMode)
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)

  useAppControls()

  return (
    <div className="contents">
      <Activity mode={viewMode === ViewMode.EDITOR ? 'visible' : 'hidden'}>
        <Editor token={token} content={content} backgroundColor={backgroundColor} />
      </Activity>

      <Activity mode={viewMode === ViewMode.PREVIEW ? 'visible' : 'hidden'}>
        <Preview content={content} token={token} backgroundColor={backgroundColor} />
      </Activity>
    </div>
  )
}
