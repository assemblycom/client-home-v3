import type { SlashCommandItem } from '@editor/components/Editor/extensions/SlashCommands.ext/types'
import { editorStore } from '@/features/editor/stores/editorStore'
import {
  AutofillIcon,
  BulletListIcon,
  CalloutIcon,
  DividerIcon,
  EmbedIcon,
  H1Icon,
  H2Icon,
  NumberedListIcon,
  TableIcon,
  TextIcon,
  UploadIcon,
} from '@/icons'

export const items: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    Icon: H1Icon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from: range.from, to: range.to + 1 })
        .setHeading1()
        .run()
    },
  },
  {
    title: 'Heading 2',
    Icon: H2Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading2().run()
    },
  },
  {
    title: 'Text',
    Icon: TextIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Autofill Fields',
    Icon: AutofillIcon,
    command: ({ editor, range }) => {
      // TODO: In later milestone we will add support for autofill fields
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Bullet List',
    Icon: BulletListIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    Icon: NumberedListIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Divider',
    Icon: DividerIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Upload',
    Icon: UploadIcon,
    command: ({ editor, range }) => {
      // TODO: Do in another task
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Table',
    Icon: TableIcon,
    command: ({ editor, range }) => {
      // TODO: Add redesigned table in another task
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
  {
    title: 'Callout',
    Icon: CalloutIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout().run()
    },
  },
  {
    title: 'Embed',
    Icon: EmbedIcon,
    command: ({ editor, range }) => {
      editor.chain().deleteRange(range).run()
      editorStore.getState().setShowEmbedInput(true)
    },
  },
]
