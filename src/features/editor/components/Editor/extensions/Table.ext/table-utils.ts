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
