'use client'

import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import { SettingsContext } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useContext, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  token: string
  content: string
  backgroundColor: string
}

export const Editor = ({ token, content, backgroundColor }: EditorProps) => {
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
    extensions: [
      ...extensions,
      ImageExt,
      FileHandlerExt.configure({
        onPaste: handleFile,
        onDrop: (currentEditor, files) => handleFile(currentEditor, files),
      }),
    ],
    content,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: { attributes: { class: `bg-[${backgroundColor}] text-custom-xs` } },
    onCreate({ editor }) {
      editor.storage.token.token = token
    },
    onUpdate: ({ editor }) => {
      settingsStoreApi?.getState().setSettings({
        content: editor.getHTML(),
      })
    },
  })

  useEffect(() => {
    if (!editor) return

    editor.view.dom.style.backgroundColor = backgroundColor
  }, [backgroundColor, editor])

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
      <EditorContent editor={editor} />
    </div>
  ) : null
}
