import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    headingCommands: {
      setHeading1: () => ReturnType
      setHeading2: () => ReturnType
    }
  }
}

export const Headings = Extension.create({
  name: 'headingCommands',

  addCommands() {
    return {
      setHeading1:
        () =>
        ({ chain }) =>
          chain().setNode('heading', { level: 1 }).run(),

      setHeading2:
        () =>
        ({ chain }) =>
          chain().setNode('heading', { level: 2 }).run(),
    }
  },
})
