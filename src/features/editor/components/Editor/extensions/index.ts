import { CalloutExt } from '@editor/components/Editor/extensions/Callout.ext'
import { Headings } from '@editor/components/Editor/extensions/Headings.ext'
import { PlaceholderExt } from '@editor/components/Editor/extensions/Placeholder.ext'
import { SlashCommandsExt } from '@editor/components/Editor/extensions/SlashCommands.ext'
import { StarterKitExt } from '@editor/components/Editor/extensions/StarterKit.ext'
import { TableExt } from '@editor/components/Editor/extensions/Table.ext'
import type { Extension, Node } from '@tiptap/core'

const extensions: Array<Extension | Node> = [
  StarterKitExt,
  Headings,
  CalloutExt,
  TableExt,
  PlaceholderExt,
  SlashCommandsExt,
]

export default extensions
