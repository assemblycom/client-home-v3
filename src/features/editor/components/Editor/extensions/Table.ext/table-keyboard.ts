import { Extension } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'

/**
 * Custom keyboard shortcuts for table row deletion:
 *
 * 1. Delete/Backspace inside an empty cell → selects the entire row
 * 2. Delete/Backspace when a row is already selected → deletes the row
 * 3. Backspace at the start of a block right after a table → selects the last row
 */
export const TableKeyboard = Extension.create({
  name: 'tableKeyboard',

  addKeyboardShortcuts() {
    const handleDelete = () => {
      const { state } = this.editor
      const { selection } = state

      // Already a row selection → delete the row
      if (selection instanceof CellSelection && selection.isRowSelection()) {
        return this.editor.chain().focus().deleteRow().run()
      }

      // Inside an empty cell → select the row
      if (!selection.empty) return false
      return selectRowIfCellEmpty(this.editor)
    }

    const handleBackspace = () => {
      const { state } = this.editor
      const { selection } = state

      // Already a row selection → delete the row
      if (selection instanceof CellSelection && selection.isRowSelection()) {
        return this.editor.chain().focus().deleteRow().run()
      }

      if (!selection.empty) return false

      // Inside an empty cell → select the row
      if (selectRowIfCellEmpty(this.editor)) return true

      // Outside the table, cursor right after a table → select last row
      return selectLastRowIfAfterTable(this.editor)
    }

    return {
      Delete: handleDelete,
      Backspace: handleBackspace,
    }
  },
})

const findCellDepth = (editor: {
  state: { selection: { $from: { depth: number; node: (d: number) => { type: { name: string } } } } }
}) => {
  const { $from } = editor.state.selection
  for (let d = $from.depth; d > 0; d--) {
    const name = $from.node(d).type.name
    if (name === 'tableCell' || name === 'tableHeader') return d
  }
  return null
}

const selectRowIfCellEmpty = (editor: import('@tiptap/core').Editor): boolean => {
  const { state } = editor
  const { $from } = state.selection

  const cellDepth = findCellDepth(editor)
  if (cellDepth === null) return false

  const cellNode = $from.node(cellDepth)

  // A cell is "empty" if it contains a single empty paragraph
  if (cellNode.childCount !== 1) return false
  const child = cellNode.firstChild
  if (!child || child.type.name !== 'paragraph' || child.textContent !== '') return false

  const $cell = state.doc.resolve($from.before(cellDepth))
  const rowSelection = CellSelection.rowSelection($cell)
  editor.view.dispatch(state.tr.setSelection(rowSelection))
  return true
}

const selectLastRowIfAfterTable = (editor: import('@tiptap/core').Editor): boolean => {
  const { state } = editor
  const { $from } = state.selection

  // Must be at the very start of the current text block
  if ($from.parentOffset !== 0) return false

  // Walk up depths to find a level where there's a previous sibling that's a table
  for (let d = $from.depth; d > 0; d--) {
    const indexInParent = $from.index(d - 1)
    // Not at start of parent at this depth → no table before us at higher depths either
    if (indexInParent === 0) {
      // Check if we're at offset 0 in this parent (might be nested)
      if ($from.start(d) !== $from.pos) break
      continue
    }

    const parent = $from.node(d - 1)
    const prevSibling = parent.child(indexInParent - 1)

    if (prevSibling.type.name !== 'table') return false

    // Find the position of the table's start
    const posBeforeCurrentBlock = $from.before(d)
    const tableStartPos = posBeforeCurrentBlock - prevSibling.nodeSize

    // Navigate to the first cell of the last row
    const table = prevSibling
    if (table.childCount === 0) return false

    const lastRow = table.lastChild
    if (!lastRow || lastRow.type.name !== 'tableRow') return false

    // Calculate position: tableStartPos + 1 (enter table) + all preceding rows + 1 (enter last row)
    let offset = tableStartPos + 1
    for (let i = 0; i < table.childCount - 1; i++) {
      offset += table.child(i).nodeSize
    }
    offset += 1 // enter the last row → now at first cell position

    const $cell = state.doc.resolve(offset)
    const rowSelection = CellSelection.rowSelection($cell)
    editor.view.dispatch(state.tr.setSelection(rowSelection))
    return true
  }

  return false
}
