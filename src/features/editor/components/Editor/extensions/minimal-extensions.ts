import { AutofillFieldExt } from '@extensions/AutofillField.ext'
import type { Extension, Mark, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Placeholder } from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'

// Single-line document: exactly one block is allowed, so pressing Enter can't
// split into a new paragraph (the autofill suggestion menu still handles Enter
// to select an item, because its plugin runs after the no-op split fails).
const SingleLineDocument = Document.extend({ content: 'block' })

interface MinimalExtensionsOptions {
  placeholder: string
}

/**
 * Extension set for the heading / subheading editors. Deliberately minimal:
 * plain text + autofill fields only — no marks, lists, tables, callouts, etc.
 */
export const getMinimalExtensions = ({ placeholder }: MinimalExtensionsOptions): Array<Extension | Node | Mark> => [
  SingleLineDocument,
  Paragraph,
  Text,
  UndoRedo,
  AutofillFieldExt,
  Placeholder.configure({ placeholder }),
]
