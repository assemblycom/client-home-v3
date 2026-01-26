'use client'

import { useEditorStore } from '@editor/stores/editorStore'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface ReadonlyEditorProps {
  token: string
  content: string
  customFields?: Record<string, string> // Not needed right now
}

export const ReadonlyEditor = ({ token, content }: ReadonlyEditorProps) => {
  const { setEditor, destroyEditor } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
    })),
  )

  const editor = useEditor({
    extensions: [...extensions, ImageExt.configure({ resize: { enabled: false } }), FileHandlerExt],
    content,
    editable: false,
    immediatelyRender: false, // Avoid SSR & hydration issues
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

  return editor ? <EditorContent editor={editor} /> : null
}
