'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import { useEditorStore } from '@editor/stores/editorStore'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const ClientPreview = () => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const { setEditor, destroyEditor } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
    })),
  )
  const handleFile = useFileHandlers()

  const editor = useEditor({
    extensions: [
      ...extensions,
      ImageExt.configure({ resize: { enabled: false } }),
      FileHandlerExt.configure({ onPaste: handleFile }),
    ],
    content,
    editable: false,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      attributes: {
        class: `bg-[${backgroundColor}] text-custom-xs`, // TODO: Replace later with settings background color
      },
    },
    onCreate({ editor }) {
      editor.storage.token.token = token
    },
  })

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  useAppControls()

  return editor ? (
    <div className={`min-h-full w-full overflow-auto px-12 py-11`} style={{ backgroundColor }}>
      <EditorContent editor={editor} />
    </div>
  ) : null
}
