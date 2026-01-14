import { CalloutExt } from '@extensions/Callout.ext'
import { DropcursorExt } from '@extensions/Dropcursor.ext'
import { EmbedExt } from '@extensions/Embed.ext'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { Headings } from '@extensions/Headings.ext'
import { ImageExt } from '@extensions/Image.ext'
import { PlaceholderExt } from '@extensions/Placeholder.ext'
import { SlashCommandsExt } from '@extensions/SlashCommands.ext'
import { StarterKitExt } from '@extensions/StarterKit.ext'
import { TableExt } from '@extensions/Table.ext'
import type { Extension, Node } from '@tiptap/core'

const extensions: Array<Extension | Node> = [
  StarterKitExt,
  Headings,
  CalloutExt,
  TableExt,
  PlaceholderExt,
  EmbedExt,
  ImageExt,
  FileHandlerExt,
  DropcursorExt,
  SlashCommandsExt,
]

export default extensions
