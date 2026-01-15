'use client'

import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useAppBridge } from '@editor/hooks/useAppBridge'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { useSettings } from '@settings/hooks/useSettingsQuery'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'

interface EditorProps {
  editable?: boolean
}

export const Editor = ({ editable = true }: EditorProps) => {
  const { settings } = useSettings()

  const editor = useEditor({
    extensions,
    content: settings.data?.content || '',
    editable,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      attributes: {
        class: 'bg-[#fff] text-custom-xs', // TODO: Replace later with settings background color
      },
    },
  })

  const { setEditor, destroyEditor, showEmbedInput, setShowEmbedInput } = useEditorStore()

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  useAppBridge()

  return editor ? (
    <div>
      <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  ) : null
}
