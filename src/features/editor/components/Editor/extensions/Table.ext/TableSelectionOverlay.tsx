'use client'

import { Icon } from '@assembly-js/design-system'
import type { TableAction } from '@editor/components/Editor/extensions/Table.ext/TableCellMenu'
import { TableActionDropdown } from '@editor/components/Editor/extensions/Table.ext/TableCellMenu'
import {
  InsertAfterColumnIcon,
  InsertAfterRowIcon,
  InsertBeforeColumnIcon,
  InsertBeforeRowIcon,
  RemoveColumnIcon,
  RemoveRowIcon,
  RemoveTableIcon,
} from '@editor/components/Editor/extensions/Table.ext/table-icons'
import type { Slice } from '@tiptap/pm/model'
import { CellSelection } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'
import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'

const OVERLAY_CLASS = 'table-selection-overlay'
const TRIGGER_CLASS = 'table-selection-trigger'
const TABLE_RADIUS = 8
const EDGE_TOLERANCE = 2

type SelectionType = 'row' | 'column' | 'table' | 'cells'

const copySliceToClipboard = (view: EditorView, slice: Slice) => {
  const { dom, text } = (
    view as unknown as { serializeForClipboard: (slice: Slice) => { dom: HTMLElement; text: string } }
  ).serializeForClipboard(slice)
  navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([dom.innerHTML], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    }),
  ])
}

// --- Selection-specific actions ---

const ROW_ACTIONS: TableAction[] = [
  {
    label: 'Insert above',
    icon: <InsertBeforeRowIcon size={13} />,
    command: (editor) => editor.chain().focus().addRowBefore().run(),
  },
  {
    label: 'Insert below',
    icon: <InsertAfterRowIcon size={13} />,
    command: (editor) => editor.chain().focus().addRowAfter().run(),
  },
  {
    label: 'Copy row',
    icon: <Icon icon="Copy" width={13} height={13} />,
    command: (editor) => {
      const { selection } = editor.state
      if (selection instanceof CellSelection) {
        copySliceToClipboard(editor.view, selection.content())
      }
    },
  },
  {
    label: 'Delete row',
    icon: <RemoveRowIcon size={13} />,
    command: (editor) => editor.chain().focus().deleteRow().run(),
  },
]

const COLUMN_ACTIONS: TableAction[] = [
  {
    label: 'Insert left',
    icon: <InsertBeforeColumnIcon size={13} />,
    command: (editor) => editor.chain().focus().addColumnBefore().run(),
  },
  {
    label: 'Insert right',
    icon: <InsertAfterColumnIcon size={13} />,
    command: (editor) => editor.chain().focus().addColumnAfter().run(),
  },
  {
    label: 'Copy column',
    icon: <Icon icon="Copy" width={13} height={13} />,
    command: (editor) => {
      const { selection } = editor.state
      if (selection instanceof CellSelection) {
        copySliceToClipboard(editor.view, selection.content())
      }
    },
  },
  {
    label: 'Delete column',
    icon: <RemoveColumnIcon size={13} />,
    command: (editor) => editor.chain().focus().deleteColumn().run(),
  },
]

const FULL_TABLE_ACTIONS: TableAction[] = [
  {
    label: 'Copy table',
    icon: <Icon icon="Copy" width={13} height={13} />,
    command: (editor) => {
      const { selection } = editor.state
      if (selection instanceof CellSelection) {
        copySliceToClipboard(editor.view, selection.content())
      }
    },
  },
  {
    label: 'Delete table',
    icon: <RemoveTableIcon size={13} />,
    command: (editor) => editor.chain().focus().deleteTable().run(),
  },
]

const getSelectionType = (selection: CellSelection): SelectionType => {
  const isRow = selection.isRowSelection()
  const isCol = selection.isColSelection()
  if (isRow && isCol) return 'table'
  if (isRow) return 'row'
  if (isCol) return 'column'
  return 'cells'
}

const getActionsForType = (type: SelectionType): TableAction[] => {
  switch (type) {
    case 'row':
      return ROW_ACTIONS
    case 'column':
      return COLUMN_ACTIONS
    case 'table':
      return FULL_TABLE_ACTIONS
    default:
      return []
  }
}

// --- Overlay DOM helpers ---

const removeOverlays = (editorDOM: HTMLElement) => {
  for (const el of editorDOM.querySelectorAll(`.${OVERLAY_CLASS}, .${TRIGGER_CLASS}`)) {
    el.remove()
  }
}

type OverlayBounds = {
  top: number
  left: number
  width: number
  height: number
}

const computeOverlayBounds = (wrapper: HTMLElement): OverlayBounds | null => {
  const table = wrapper.querySelector('table')
  if (!table) return null

  const selectedCells = table.querySelectorAll<HTMLElement>('.selectedCell')
  if (selectedCells.length === 0) return null

  const tableRect = table.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()

  let minTop = Number.POSITIVE_INFINITY
  let minLeft = Number.POSITIVE_INFINITY
  let maxBottom = Number.NEGATIVE_INFINITY
  let maxRight = Number.NEGATIVE_INFINITY

  for (const cell of selectedCells) {
    const cellRect = cell.getBoundingClientRect()
    minTop = Math.min(minTop, cellRect.top)
    minLeft = Math.min(minLeft, cellRect.left)
    maxBottom = Math.max(maxBottom, cellRect.bottom)
    maxRight = Math.max(maxRight, cellRect.right)
  }

  const touchesTop = Math.abs(minTop - tableRect.top) < EDGE_TOLERANCE
  const touchesBottom = Math.abs(maxBottom - tableRect.bottom) < EDGE_TOLERANCE
  const touchesLeft = Math.abs(minLeft - tableRect.left) < EDGE_TOLERANCE
  const touchesRight = Math.abs(maxRight - tableRect.right) < EDGE_TOLERANCE

  // Account for wrapper scroll offset since overlay is position:absolute inside the scrollable wrapper
  const scrollLeft = wrapper.scrollLeft
  const scrollTop = wrapper.scrollTop

  const top = (touchesTop ? tableRect.top - wrapperRect.top : minTop - wrapperRect.top) + scrollTop
  const left = (touchesLeft ? tableRect.left - wrapperRect.left : minLeft - wrapperRect.left) + scrollLeft
  const right = touchesRight ? tableRect.right : maxRight
  const bottom = touchesBottom ? tableRect.bottom : maxBottom
  const width = right - (touchesLeft ? tableRect.left : minLeft)
  const height = bottom - (touchesTop ? tableRect.top : minTop)

  const tlr = touchesTop && touchesLeft ? TABLE_RADIUS : 0
  const trr = touchesTop && touchesRight ? TABLE_RADIUS : 0
  const brr = touchesBottom && touchesRight ? TABLE_RADIUS : 0
  const blr = touchesBottom && touchesLeft ? TABLE_RADIUS : 0

  const overlay = document.createElement('div')
  overlay.className = OVERLAY_CLASS
  overlay.style.top = `${top}px`
  overlay.style.left = `${left}px`
  overlay.style.width = `${width}px`
  overlay.style.height = `${height}px`
  overlay.style.borderRadius = `${tlr}px ${trr}px ${brr}px ${blr}px`
  wrapper.appendChild(overlay)

  return { top, left, width, height }
}

const ELLIPSIS_SVG_H =
  '<svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1.5" fill="white"/><circle cx="7" cy="2" r="1.5" fill="white"/><circle cx="12" cy="2" r="1.5" fill="white"/></svg>'

const ELLIPSIS_SVG_V =
  '<svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1.5" fill="white"/><circle cx="2" cy="7" r="1.5" fill="white"/><circle cx="2" cy="12" r="1.5" fill="white"/></svg>'

const createTriggerPill = (
  wrapper: HTMLElement,
  bounds: OverlayBounds,
  selectionType: SelectionType,
  onTriggerClick: (rect: DOMRect) => void,
): HTMLButtonElement | null => {
  if (selectionType === 'cells') return null

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = TRIGGER_CLASS
  trigger.setAttribute('aria-label', `${selectionType} actions`)

  // Position absolute inside the wrapper (scrolls naturally, no lag)
  if (selectionType === 'row') {
    trigger.style.top = `${bounds.top + bounds.height / 2 - 12}px`
    trigger.style.left = `${bounds.left - 5}px`
    trigger.style.width = '10px'
    trigger.style.height = '24px'
    trigger.innerHTML = ELLIPSIS_SVG_V
  } else if (selectionType === 'column') {
    trigger.style.top = `${bounds.top - 5}px`
    trigger.style.left = `${bounds.left + bounds.width / 2 - 12}px`
    trigger.style.width = '24px'
    trigger.style.height = '10px'
    trigger.innerHTML = ELLIPSIS_SVG_H
  } else {
    trigger.style.top = `${bounds.top + 4}px`
    trigger.style.left = `${bounds.left - 5}px`
    trigger.style.width = '10px'
    trigger.style.height = '24px'
    trigger.innerHTML = ELLIPSIS_SVG_V
  }

  trigger.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onTriggerClick(trigger.getBoundingClientRect())
  })

  wrapper.appendChild(trigger)
  return trigger
}

// --- Main component ---

export const TableSelectionOverlay = ({ editor }: { editor: Editor }) => {
  const [menuState, setMenuState] = useState<{
    type: SelectionType
    triggerRect: DOMRect
  } | null>(null)

  const closeMenu = useCallback(() => setMenuState(null), [])

  useEffect(() => {
    const editorDOM = editor.view.dom

    const updateOverlay = () => {
      removeOverlays(editorDOM)
      setMenuState(null)

      const { selection } = editor.state
      if (!(selection instanceof CellSelection)) return

      const selectionType = getSelectionType(selection)

      const $from = selection.$anchorCell
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth)
        if (node.type.name === 'table') {
          const pos = $from.before(depth)
          const dom = editor.view.nodeDOM(pos)
          if (dom instanceof HTMLElement) {
            const wrapper = dom.closest('.tableWrapper') as HTMLElement | null
            if (wrapper) {
              requestAnimationFrame(() => {
                removeOverlays(editorDOM)
                const bounds = computeOverlayBounds(wrapper)
                if (bounds) {
                  createTriggerPill(wrapper, bounds, selectionType, (rect) => {
                    setMenuState({ type: selectionType, triggerRect: rect })
                  })
                }
              })
            }
          }
          break
        }
      }
    }

    editor.on('selectionUpdate', updateOverlay)
    editor.on('transaction', updateOverlay)

    return () => {
      editor.off('selectionUpdate', updateOverlay)
      editor.off('transaction', updateOverlay)
      removeOverlays(editorDOM)
    }
  }, [editor])

  if (!menuState) return null

  const actions = getActionsForType(menuState.type)
  if (actions.length === 0) return null

  const { triggerRect, type } = menuState
  let menuTop: number
  let menuLeft: number
  let transform: string | undefined

  const MENU_WIDTH = 180
  if (type === 'row' || type === 'table') {
    menuTop = triggerRect.top
    const hasSpaceLeft = triggerRect.left - MENU_WIDTH - 4 > 0
    if (hasSpaceLeft) {
      menuLeft = triggerRect.left - 4
      transform = 'translateX(-100%)'
    } else {
      menuLeft = triggerRect.right + 4
      transform = undefined
    }
  } else {
    menuTop = triggerRect.bottom + 4
    menuLeft = triggerRect.left + triggerRect.width / 2
    transform = 'translateX(-50%)'
  }

  return (
    <TableActionDropdown
      actions={actions}
      editor={editor}
      top={menuTop}
      left={menuLeft}
      transform={transform}
      onClose={closeMenu}
    />
  )
}
