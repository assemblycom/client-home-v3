import { Extension } from '@tiptap/core'
import { Plugin, TextSelection } from '@tiptap/pm/state'

/**
 * prosemirror-tables' `createSelectionBetween` hands back `view.state.selection` while a cell
 * selection is active. When the caller is resolving against an already-modified doc (drop, DOM
 * change) that stale selection throws `RangeError: Selection passed to setSelection must point at
 * the current document`. Runs first and only steps in for that mismatch; otherwise defers.
 */
export const TableStaleSelectionGuard = Extension.create({
  name: 'tableStaleSelectionGuard',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          createSelectionBetween: (view, $anchor, $head) =>
            $anchor.doc === view.state.doc ? null : TextSelection.between($anchor, $head),
        },
      }),
    ]
  },
})
