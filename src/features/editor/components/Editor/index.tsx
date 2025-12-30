'use client'

import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const content = ''

export const Editor = () => {
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
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
    ],
    content,
    immediatelyRender: false, // Avoid SSR & hydration issues
  })

  return <EditorContent editor={editor} />
}
