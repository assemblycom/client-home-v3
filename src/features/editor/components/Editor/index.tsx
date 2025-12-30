'use client'

import { usePrimaryCta } from '@app-bridge/hooks'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const content = ''

export const Editor = () => {
  usePrimaryCta({
    label: 'Save Changes',
    onClick: () => {
      console.log('Save Changes')
    },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false, // Avoid SSR & hydration issues
  })

  return <EditorContent editor={editor} />
}
