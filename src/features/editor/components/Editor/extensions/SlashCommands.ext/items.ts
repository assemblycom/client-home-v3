import type { SlashCommandItem } from './types'

export const items: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading1().run()
    },
  },
  {
    title: 'Heading 2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading2().run()
    },
  },
  {
    title: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Autofill Fields',
    command: ({ editor, range }) => {
      // TODO: In later milestone we will add support for autofill fields
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Bullet List',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Divider',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Upload',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: 'Table',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContentAt(range.from, { type: 'imagePlaceholder' }).run()
    },
  },
  {
    title: 'Callout',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContentAt(range.from, { type: 'videoPlaceholder' }).run()
    },
  },
  {
    title: 'Embed',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContentAt(range.from, { type: 'videoPlaceholder' }).run()
    },
  },
]
