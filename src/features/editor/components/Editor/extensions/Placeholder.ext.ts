import { DEFAULT_EDITOR_PLACEHOLDER } from '@editor/constants'
import { Placeholder } from '@tiptap/extension-placeholder'

export const PlaceholderExt = Placeholder.configure({
  placeholder: DEFAULT_EDITOR_PLACEHOLDER,
})
