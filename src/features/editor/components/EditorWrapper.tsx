'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { Editor } from '@editor/components/Editor'
import { Preview } from '@editor/components/Preview'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Activity, useMemo } from 'react'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'
import { getActivityMode } from '@/utils/activity'
import { getTimeOfDay } from '@/utils/date'

export function EditorWrapper() {
  const viewMode = useViewStore((store) => store.viewMode)
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)

  const greeting = useMemo(() => getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1), [])

  useAppControls()

  return (
    <div className="contents">
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div className="tiptap-wrapper" style={{ backgroundColor }}>
          <div className="flex ps-6 pt-5 font-medium text-custom-xl leading-7">
            <div>Good {greeting},&nbsp;</div>
            {/* Static placeholder for now */}
            <div>User</div>
          </div>
          <Editor token={token} content={content} backgroundColor={backgroundColor} />
        </div>
      </Activity>

      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <Preview content={content} token={token} backgroundColor={backgroundColor} />
      </Activity>
    </div>
  )
}
