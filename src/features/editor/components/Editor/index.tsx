'use client'

import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { EditorContent, useEditor } from '@tiptap/react'
import { ClientHomeEditor } from './ClientHomeEditor'

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
    extensions: [ClientHomeEditor],
    content,
    editable,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      attributes: {
        class: 'bg-[#fff]', // TODO: Replace later with settings background color
      },
    },
  })

  return <EditorContent editor={editor} />
}
