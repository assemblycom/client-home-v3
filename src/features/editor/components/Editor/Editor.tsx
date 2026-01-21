'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  editable?: boolean
}

export const Editor = ({ editable = true }: EditorProps) => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
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
    extensions: [...extensions, FileHandlerExt.configure({ onPaste: handleFile })],
    content,
    editable,
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
    if (!editor) return

    editor.view.dom.style.backgroundColor = backgroundColor
  }, [backgroundColor, editor])

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  useAppControls()

  return editor ? (
    <div>
      <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  ) : null
}
