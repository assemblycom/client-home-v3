import type { Editor, Range } from '@tiptap/core'
import type { SVGIcon } from '@/icons'

export type SlashCommandContext = Readonly<{
  editor: Editor
  range: Range
}>

export type SlashCommandItem = Readonly<{
  title: string
  Icon: SVGIcon
  element?: React.ReactNode
  command: (ctx: SlashCommandContext) => void
}>
