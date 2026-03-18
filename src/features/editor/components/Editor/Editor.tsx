'use client'

import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import { TableCellMenu } from '@extensions/Table.ext/TableCellMenu'
import { SettingsContext } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useContext, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  content: string
}

export const Editor = ({ content }: EditorProps) => {
  const settingsStoreApi = useContext(SettingsContext)
  const { setEditor, destroyEditor, showEmbedInput, setShowEmbedInput } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
      showEmbedInput: s.showEmbedInput,
      setShowEmbedInput: s.setShowEmbedInput,
    })),
  )
  const handleFile = useFileHandlers()

  const editor = useEditor({
    extensions: [...extensions, ImageExt, FileHandlerExt.configure({ onPaste: handleFile })],
    content,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: { attributes: { class: 'text-custom-xs' } },
    onUpdate: ({ editor }) => {
      settingsStoreApi?.getState().setSettings({
        content: editor.getHTML(),
      })
    },
  })

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  return editor ? (
    <div>
      <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <TableCellMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  ) : null
}
