import type { Editor } from '@tiptap/react'

export const getActiveCellDOM = (editor: Editor): HTMLElement | null => {
  const { selection } = editor.state
  const resolved = selection.$from

  for (let depth = resolved.depth; depth > 0; depth--) {
    const node = resolved.node(depth)
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      const pos = resolved.before(depth)
      const dom = editor.view.nodeDOM(pos)
      if (dom instanceof HTMLElement) return dom
      break
    }
  }
  return null
}

// posAtDOM returns -1 when the element has no ViewDesc — i.e. ProseMirror re-rendered
// the table and this is a detached node captured by an earlier render.
export const getPosFromCellDOM = ({ editor, cell }: { editor: Editor; cell: HTMLElement }): number | null => {
  const pos = editor.view.posAtDOM(cell, 0)
  return pos < 0 ? null : pos
}

export const getActiveTableWrapper = (editor: Editor): HTMLElement | null => {
  const cell = getActiveCellDOM(editor)
  if (!cell) return null
  return cell.closest('.tableWrapper') as HTMLElement | null
}

let cellKeyCounter = 0
const cellKeyMap = new WeakMap<HTMLElement, number>()

export const getCellKey = (cell: HTMLElement): number => {
  let key = cellKeyMap.get(cell)
  if (key === undefined) {
    key = cellKeyCounter++
    cellKeyMap.set(cell, key)
  }
  return key
}
