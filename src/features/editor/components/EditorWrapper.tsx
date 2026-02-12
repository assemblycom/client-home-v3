'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { Editor } from '@editor/components/Editor'
import { Heading } from '@editor/components/Heading'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { Subheading } from '@editor/components/Subheading'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import type { Settings } from '@settings/lib/settings/settings.entity'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { EditorContext, useEditor } from '@tiptap/react'
import { clsx } from 'clsx'
import { useEffect, useMemo } from 'react'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { DisplayMode, useViewStore, ViewMode } from '@/features/editor/stores/viewStore'

interface Props {
  settings?: Pick<Settings, 'content'> | null
}

export function EditorWrapper({ settings }: Props) {
  const viewMode = useViewStore((store) => store.viewMode)
  const token = useAuthStore((store) => store.token)
  // const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)

  const handleFile = useFileHandlers()

  const setHasChanged = useSettingsStore((s) => s.setHasChanged)

  const editor = useEditor({
    extensions: [...extensions, ImageExt, FileHandlerExt.configure({ onPaste: handleFile })],
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: { attributes: { class: `bg-[${backgroundColor}] text-custom-xs` } },
    onCreate({ editor }) {
      editor.storage.token.token = token
    },
    content: settings?.content || '',
    editable: viewMode === ViewMode.EDITOR,
    onUpdate: ({ editor }) => {
      setHasChanged(editor?.getHTML()?.trim() !== settings?.content?.trim())
    },
  })

  useEffect(() => {
    editor?.setEditable(viewMode === ViewMode.EDITOR)
  }, [viewMode, editor])

  useAppControls()

  const providerValue = useMemo(() => ({ editor }), [editor])

  const displayMode = useViewStore((store) => store.displayMode)

  const workspace = useViewStore((store) => store.workspace)

  return (
    <EditorContext.Provider value={providerValue}>
      <div
        className={clsx('tiptap-wrapper @container max-w-full @max-md:rounded-t-none bg-brand', {
          'mx-auto max-w-sm': displayMode === DisplayMode.MOBILE,
        })}
      >
        {viewMode === ViewMode.PREVIEW && <PreviewTopBar url={workspace?.portalUrl} />}
        <Heading />
        <Subheading />
        <ActionsCard />
        <Editor />
      </div>
    </EditorContext.Provider>
  )
}
