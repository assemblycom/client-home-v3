import { useCurrentEditor, useEditorState } from '@tiptap/react'

export function useEditorContent() {
  const { editor } = useCurrentEditor()
  const editorState = useEditorState({
    editor,

    // the selector function is used to select the state you want to react to
    selector: ({ editor }) => {
      if (!editor) return null

      return {
        currentContent: editor.getHTML(),
        // you can add more state properties here e.g.:
        // isBold: editor.isActive('bold'),
        // isItalic: editor.isActive('italic'),
      }
    },
  })

  return {
    html: editorState?.currentContent || '',
  }
}
