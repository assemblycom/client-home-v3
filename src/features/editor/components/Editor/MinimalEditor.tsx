'use client'

import { getMinimalExtensions } from '@extensions/minimal-extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { cn } from '@/utils/tailwind'

interface MinimalEditorProps {
  /** HTML string. May be plain text or contain `<autofill-field>` nodes. */
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  editable?: boolean
  /** Typography classes applied to the wrapper; the editor content inherits them. */
  className?: string
}

/**
 * A single-line rich text field supporting plain text and autofill fields only.
 * Reused for the home page heading and subheading. When `editable` is false the
 * autofill chips resolve to their actual values (via the shared NodeView).
 */
export const MinimalEditor = ({
  value,
  onChange,
  placeholder = '',
  editable = true,
  className,
}: MinimalEditorProps) => {
  const editor = useEditor({
    extensions: getMinimalExtensions({ placeholder }),
    content: value,
    editable,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      // Paste as plain text, collapsing whitespace to keep the field single-line.
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return false
        view.dispatch(view.state.tr.insertText(text.replace(/\s+/g, ' ')))
        return true
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  })

  // Sync content when the value changes externally (segment switch, cancel,
  // save success). Guarded so it never clobbers the cursor while typing — during
  // editing `getHTML()` already equals the incoming value.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  // Keep the editable state in sync when the same instance is reused read-only.
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  return (
    <div className={cn('minimal-editor', className)}>
      <EditorContent editor={editor} />
    </div>
  )
}
