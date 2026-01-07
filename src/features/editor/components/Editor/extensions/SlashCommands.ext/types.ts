import type { Editor, Range } from '@tiptap/core'

export type SlashCommandContext = Readonly<{
  editor: Editor
  range: Range
}>

export type SlashCommandItem = Readonly<{
  title: string
  element?: React.ReactNode
  command: (ctx: SlashCommandContext) => void
}>
