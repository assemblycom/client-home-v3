'use client'

import { Editor } from '@editor/components/Editor'
import { Preview } from '@editor/components/Preview'
import { Activity } from 'react'
import type { User } from '@/features/auth/lib/user.entity'
import { useViewStore, ViewMode } from '@/features/editor/stores/viewStore'

interface Props extends User {}

export function EditorWrapper(props: Props) {
  const { viewMode } = useViewStore()

  return (
    <div className="contents">
      <Activity mode={viewMode === ViewMode.EDITOR ? 'visible' : 'hidden'}>
        <Editor content="" />
      </Activity>

      <Activity mode={viewMode === ViewMode.PREVIEW ? 'visible' : 'hidden'}>
        <Preview {...props} />
      </Activity>
    </div>
  )
}
