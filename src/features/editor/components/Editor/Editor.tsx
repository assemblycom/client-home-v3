'use client'

import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useEditorStore } from '@editor/stores/editorStore'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import { EditorContent, useCurrentEditor } from '@tiptap/react'
import { useShallow } from 'zustand/shallow'

export const Editor = () => {
  const { editor } = useCurrentEditor()

  const viewMode = useViewStore((s) => s.viewMode)

  const { showEmbedInput, setShowEmbedInput } = useEditorStore(
    useShallow((s) => ({
      showEmbedInput: s.showEmbedInput,
      setShowEmbedInput: s.setShowEmbedInput,
    })),
  )

  return editor ? (
    <div>
      {viewMode === ViewMode.EDITOR && (
        <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
          <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  ) : null
}
