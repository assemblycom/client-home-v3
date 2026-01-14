'use client'

import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'

interface EditorProps {
  content: string
  editable?: boolean
}

export const Editor = ({ content, editable = true }: EditorProps) => {
  useSecondaryCta({
    label: 'Cancel',
    onClick: () => {
      // Implement later when we do API implementation
      console.info('Cancel')
    },
  })

  usePrimaryCta({
    label: 'Save Changes',
    onClick: () => {
      // Implement later when we do API implementation
      console.info('Save Changes')
    },
  })

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
  })

  const { setEditor, destroyEditor, showEmbedInput, setShowEmbedInput } = useEditorStore()

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  return editor ? (
    <div>
      <BubbleMenu id="asdf" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  ) : null
}
