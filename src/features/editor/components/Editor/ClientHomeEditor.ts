import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

/**
 * This extension will be used to hold all the extensions, functionality & commands
 * required for Client Home
 */
export const ClientHomeEditor = Extension.create({
  name: 'clientHomeEditor',

  addExtensions() {
    return [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
    ]
  },
})
