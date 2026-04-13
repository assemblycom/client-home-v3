import { AutofillFieldExt } from '@extensions/AutofillField.ext'
import { CalloutExt } from '@extensions/Callout.ext'
import { DropcursorExt } from '@extensions/Dropcursor.ext'
import { EmbedExt } from '@extensions/Embed.ext'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { Headings } from '@extensions/Headings.ext'
import { LinkExt } from '@extensions/Link.ext'
import { PlaceholderExt } from '@extensions/Placeholder.ext'
import { SlashCommandsExt } from '@extensions/SlashCommands.ext'
import { StarterKitExt } from '@extensions/StarterKit.ext'
import { TableExt } from '@extensions/Table.ext'
import type { Extension, Mark, Node } from '@tiptap/core'

const extensions: Array<Extension | Node | Mark> = [
  StarterKitExt,
  Headings,
  CalloutExt,
  ...TableExt,
  PlaceholderExt,
  EmbedExt,
  FileHandlerExt,
  DropcursorExt,
  SlashCommandsExt,
  AutofillFieldExt,
  LinkExt,
]

export default extensions
