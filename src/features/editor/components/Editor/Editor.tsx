'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  editable?: boolean
}

export const Editor = ({ editable = true }: EditorProps) => {
  const content = useSettingsStore((store) => store.content)
  const token = useAuthStore((store) => store.token)
  const setContent = useSettingsStore((store) => store.setContent)
  const { setEditor, destroyEditor, showEmbedInput, setShowEmbedInput } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
      showEmbedInput: s.showEmbedInput,
      setShowEmbedInput: s.setShowEmbedInput,
    })),
  )

  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      attributes: {
        class: 'bg-[#fff] text-custom-xs', // TODO: Replace later with settings background color
      },
    },
    onCreate({ editor }) {
      // @ts-expect-error storage is not strictly typed right now
      editor.storage.token.token = token
    },
    onUpdate({ editor }) {
      setContent(editor.getHTML())
    },
  })

  useEffect(() => {
    editor?.commands.setContent(content)
  }, [content, editor])

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
