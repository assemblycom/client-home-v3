'use client'

import { Editor } from '@editor/components/Editor'
import { Preview } from '@editor/components/Preview'
import { Activity } from 'react'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'

export function EditorWrapper() {
  const viewMode = useViewStore((store) => store.viewMode)

  return (
    <div className="contents">
      <Activity mode={viewMode === ViewMode.EDITOR ? 'visible' : 'hidden'}>
        <Editor />
      </Activity>

      <Activity mode={viewMode === ViewMode.PREVIEW ? 'visible' : 'hidden'}>
        <Preview />
      </Activity>
    </div>
  )
}
