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
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const OVERLAY_CLASS = 'table-selection-overlay'
const TRIGGER_CLASS = 'table-selection-trigger'
const HOVER_TRIGGER_CLASS = 'table-hover-trigger'
const CONTEXTUAL_MENU_CLASS = 'table-contextual-menu'
const TABLE_RADIUS = 8
const EDGE_TOLERANCE = 2

type SelectionType = 'row' | 'column' | 'table' | 'cells'

const copySliceToClipboard = (view: EditorView, slice: Slice) => {
  const { dom, text } = (
    view as unknown as { serializeForClipboard: (slice: Slice) => { dom: HTMLElement; text: string } }
  ).serializeForClipboard(slice)

  const htmlContent = dom.innerHTML
  const textContent = text

  // Try the modern Clipboard API first, fall back to execCommand for iframe contexts
  // where the clipboard-write permission is not granted
  if (navigator.clipboard?.write) {
    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' }),
        }),
      ])
      .catch(() => {
        copyViaExecCommand(htmlContent, textContent)
      })
  } else {
    copyViaExecCommand(htmlContent, textContent)
  }
}

const copyViaExecCommand = (html: string, text: string) => {
  const listener = (e: ClipboardEvent) => {
    e.preventDefault()
    e.clipboardData?.setData('text/html', html)
    e.clipboardData?.setData('text/plain', text)
  }
  document.addEventListener('copy', listener)
  document.execCommand('copy')
  document.removeEventListener('copy', listener)
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
  for (const el of editorDOM.querySelectorAll(`.${OVERLAY_CLASS}`)) {
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

// --- Pill viewport position (for portal rendering) ---

type PillPosition = { top: number; left: number; width: number; height: number }

const computePillViewportPosition = (wrapper: HTMLElement, selectionType: SelectionType): PillPosition | null => {
  if (selectionType === 'cells') return null

  const table = wrapper.querySelector('table')
  if (!table) return null
  const selectedCells = table.querySelectorAll<HTMLElement>('.selectedCell')
  if (selectedCells.length === 0) return null

  const tableRect = table.getBoundingClientRect()

  let minTop = Number.POSITIVE_INFINITY
  let minLeft = Number.POSITIVE_INFINITY
  let maxBottom = Number.NEGATIVE_INFINITY
  let maxRight = Number.NEGATIVE_INFINITY

  for (const cell of selectedCells) {
    const r = cell.getBoundingClientRect()
    minTop = Math.min(minTop, r.top)
    minLeft = Math.min(minLeft, r.left)
    maxBottom = Math.max(maxBottom, r.bottom)
    maxRight = Math.max(maxRight, r.right)
  }

  const touchesTop = Math.abs(minTop - tableRect.top) < EDGE_TOLERANCE
  const touchesLeft = Math.abs(minLeft - tableRect.left) < EDGE_TOLERANCE
  const touchesRight = Math.abs(maxRight - tableRect.right) < EDGE_TOLERANCE
  const touchesBottom = Math.abs(maxBottom - tableRect.bottom) < EDGE_TOLERANCE

  const selTop = touchesTop ? tableRect.top : minTop
  const selLeft = touchesLeft ? tableRect.left : minLeft
  const selRight = touchesRight ? tableRect.right : maxRight
  const selBottom = touchesBottom ? tableRect.bottom : maxBottom
  const selWidth = selRight - selLeft
  const selHeight = selBottom - selTop

  let pillTop: number
  let pillLeft: number
  let pillWidth: number
  let pillHeight: number

  if (selectionType === 'row') {
    pillWidth = 10
    pillHeight = 24
    pillTop = selTop + selHeight / 2 - 12
    pillLeft = selLeft - 5
  } else if (selectionType === 'column') {
    pillWidth = 24
    pillHeight = 10
    pillTop = selTop - 5
    pillLeft = selLeft + selWidth / 2 - 12
  } else {
    // table – contextual menu button (different from row/column pill)
    pillWidth = 16
    pillHeight = 18
    pillTop = selTop
    pillLeft = selLeft - 21
  }

  // Hide pill when selection is scrolled out of the wrapper's overflow area
  // (e.g. column scrolled off-screen horizontally), but NOT for page-level scroll.
  const wrapperRect = wrapper.getBoundingClientRect()
  if (selectionType === 'table') {
    // Table contextual menu is outside the wrapper to the left, so check
    // whether the table's left edge has scrolled past the wrapper's left edge
    if (selLeft < wrapperRect.left) {
      return null
    }
  } else {
    const pillCenterX = pillLeft + pillWidth / 2
    const pillCenterY = pillTop + pillHeight / 2
    if (
      pillCenterX < wrapperRect.left ||
      pillCenterX > wrapperRect.right ||
      pillCenterY < wrapperRect.top ||
      pillCenterY > wrapperRect.bottom
    ) {
      return null
    }
  }

  return { top: pillTop, left: pillLeft, width: pillWidth, height: pillHeight }
}

// --- Hover pill position from a hovered cell ---

type SinglePillInfo = {
  type: 'row' | 'column'
  pos: PillPosition
}

type HoverPillInfo = {
  row: SinglePillInfo | null
  col: SinglePillInfo | null
  wrapper: HTMLElement
  cell: HTMLElement
}

const clipCheck = (pos: PillPosition, wrapperRect: DOMRect): boolean => {
  const cx = pos.left + pos.width / 2
  const cy = pos.top + pos.height / 2
  return cx >= wrapperRect.left && cx <= wrapperRect.right && cy >= wrapperRect.top && cy <= wrapperRect.bottom
}

const computeHoverPill = (cell: HTMLElement, wrapper: HTMLElement): HoverPillInfo | null => {
  const table = wrapper.querySelector('table')
  if (!table) return null
  const tableRect = table.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()

  const row = cell.closest('tr')
  if (!row) return null

  const rowRect = row.getBoundingClientRect()
  const cellRect = cell.getBoundingClientRect()

  // Row pill: centered vertically on the row, at the table's left edge
  const rowPill: PillPosition = {
    width: 4,
    height: 24,
    top: rowRect.top + rowRect.height / 2 - 12,
    left: tableRect.left - 2,
  }

  // Column pill: centered horizontally on the column, at the table's top edge
  const colPill: PillPosition = {
    width: 24,
    height: 4,
    top: tableRect.top - 2,
    left: cellRect.left + cellRect.width / 2 - 12,
  }

  const rowInfo: SinglePillInfo | null = clipCheck(rowPill, wrapperRect) ? { type: 'row', pos: rowPill } : null
  const colInfo: SinglePillInfo | null = clipCheck(colPill, wrapperRect) ? { type: 'column', pos: colPill } : null

  if (!rowInfo && !colInfo) return null

  return { row: rowInfo, col: colInfo, wrapper, cell }
}

// --- SVG icons for pills ---

const EllipsisH = ({ fill = 'white' }: { fill?: string }) => (
  <svg
    role="img"
    aria-label="Actions"
    width="14"
    height="4"
    viewBox="0 0 14 4"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="2" cy="2" r="1.5" fill={fill} />
    <circle cx="7" cy="2" r="1.5" fill={fill} />
    <circle cx="12" cy="2" r="1.5" fill={fill} />
  </svg>
)

const EllipsisV = ({ fill = 'white' }: { fill?: string }) => (
  <svg
    role="img"
    aria-label="Actions"
    width="4"
    height="14"
    viewBox="0 0 4 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="2" cy="2" r="1.5" fill={fill} />
    <circle cx="2" cy="7" r="1.5" fill={fill} />
    <circle cx="2" cy="12" r="1.5" fill={fill} />
  </svg>
)

// --- Hover pill button (resting → expanded on hover) ---

const RESTING_ROW = { width: 4, height: 24 }
const EXPANDED_ROW = { width: 10, height: 24 }
const RESTING_COL = { width: 24, height: 4 }
const EXPANDED_COL = { width: 24, height: 10 }

type MenuState = {
  type: SelectionType
  triggerRect: DOMRect
  actions?: TableAction[]
}

const HoverPillButton = ({
  pill,
  hoverPill,
  editor,
  hoverPillHoveredRef,
  hoverCellRef,
  setHoverPill,
  setMenuState,
}: {
  pill: SinglePillInfo
  hoverPill: HoverPillInfo
  editor: Editor
  hoverPillHoveredRef: React.MutableRefObject<boolean>
  hoverCellRef: React.MutableRefObject<HTMLElement | null>
  setHoverPill: React.Dispatch<React.SetStateAction<HoverPillInfo | null>>
  setMenuState: React.Dispatch<React.SetStateAction<MenuState | null>>
}) => {
  const [expanded, setExpanded] = useState(false)
  const resting = pill.type === 'row' ? RESTING_ROW : RESTING_COL
  const active = pill.type === 'row' ? EXPANDED_ROW : EXPANDED_COL
  const size = expanded ? active : resting

  // Center the pill at the same midpoint regardless of state
  const midX = pill.pos.left + pill.pos.width / 2
  const midY = pill.pos.top + pill.pos.height / 2
  const top = midY - size.height / 2
  const left = midX - size.width / 2

  return (
    <button
      type="button"
      className={HOVER_TRIGGER_CLASS}
      aria-label={`${pill.type} actions`}
      style={{
        position: 'fixed',
        top,
        left,
        width: size.width,
        height: size.height,
      }}
      onMouseEnter={() => {
        hoverPillHoveredRef.current = true
        setExpanded(true)
      }}
      onMouseLeave={() => {
        setExpanded(false)
        hoverPillHoveredRef.current = false
        hoverCellRef.current = null
        setHoverPill(null)
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Build a transient CellSelection to pre-compute the copy slice
        // without changing the editor's actual selection
        const innerPos = editor.view.posAtDOM(hoverPill.cell, 0)
        const $resolved = editor.state.doc.resolve(innerPos)
        let cellDepth = $resolved.depth
        while (cellDepth > 0 && !$resolved.node(cellDepth).type.spec.tableRole?.includes('cell')) {
          cellDepth--
        }
        const $cell = editor.state.doc.resolve($resolved.before(cellDepth))
        const cellSelection =
          pill.type === 'row' ? CellSelection.rowSelection($cell) : CellSelection.colSelection($cell)
        const slice = cellSelection.content()
        // Move cursor into the hovered cell so all commands know the target row/column
        const focusCell = () => editor.chain().focus().setTextSelection(innerPos).run()
        const baseActions = getActionsForType(pill.type)
        const hoverActions = baseActions.map((action) =>
          action.label.startsWith('Copy')
            ? { ...action, command: () => copySliceToClipboard(editor.view, slice) }
            : {
                ...action,
                command: (ed: Editor) => {
                  focusCell()
                  action.command(ed)
                },
              },
        )
        setMenuState({
          type: pill.type,
          triggerRect: e.currentTarget.getBoundingClientRect(),
          actions: hoverActions,
        })
      }}
    >
      {expanded && (pill.type === 'column' ? <EllipsisH fill="#637381" /> : <EllipsisV fill="#637381" />)}
    </button>
  )
}

// --- Main component ---

type PillState = {
  type: SelectionType
  wrapper: HTMLElement
  pos: PillPosition | null
}

export const TableSelectionOverlay = ({ editor }: { editor: Editor }) => {
  const [menuState, setMenuState] = useState<MenuState | null>(null)
  const [pillState, setPillState] = useState<PillState | null>(null)
  const [hoverPill, setHoverPill] = useState<HoverPillInfo | null>(null)
  const hoverCellRef = useRef<HTMLElement | null>(null)
  const hoverPillHoveredRef = useRef(false)

  const closeMenu = useCallback(() => setMenuState(null), [])

  const updatePillPosition = useCallback(() => {
    setPillState((prev) => {
      if (!prev) return null
      const pos = computePillViewportPosition(prev.wrapper, prev.type)
      return { ...prev, pos }
    })
  }, [])

  // --- Hover tracking on table cells ---
  useEffect(() => {
    const editorDOM = editor.view.dom

    const handleMouseMove = (e: MouseEvent) => {
      if (hoverPillHoveredRef.current) return

      const target = e.target as HTMLElement
      const cell = target.closest('td, th') as HTMLElement | null
      if (!cell) {
        if (hoverCellRef.current) {
          hoverCellRef.current = null
          setHoverPill(null)
        }
        return
      }

      if (cell === hoverCellRef.current) return
      hoverCellRef.current = cell

      const wrapper = cell.closest('.tableWrapper') as HTMLElement | null
      if (!wrapper) {
        setHoverPill(null)
        return
      }

      const pill = computeHoverPill(cell, wrapper)
      setHoverPill(pill)
    }

    const handleMouseLeave = () => {
      if (hoverPillHoveredRef.current) return
      hoverCellRef.current = null
      setHoverPill(null)
    }

    editorDOM.addEventListener('mousemove', handleMouseMove)
    editorDOM.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      editorDOM.removeEventListener('mousemove', handleMouseMove)
      editorDOM.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor])

  useEffect(() => {
    const editorDOM = editor.view.dom

    const updateOverlay = () => {
      removeOverlays(editorDOM)
      setMenuState(null)
      setPillState(null)

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
                  const pillPos = computePillViewportPosition(wrapper, selectionType)
                  setPillState({ type: selectionType, wrapper, pos: pillPos })
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

  // Update pill position on scroll/resize so it tracks the table
  const pillWrapper = pillState?.wrapper ?? null
  useEffect(() => {
    if (!pillWrapper) return
    pillWrapper.addEventListener('scroll', updatePillPosition)
    window.addEventListener('scroll', updatePillPosition, true)
    window.addEventListener('resize', updatePillPosition)
    return () => {
      pillWrapper.removeEventListener('scroll', updatePillPosition)
      window.removeEventListener('scroll', updatePillPosition, true)
      window.removeEventListener('resize', updatePillPosition)
    }
  }, [pillWrapper, updatePillPosition])

  // Update hover pill position on scroll/resize so it tracks the table
  const hoverWrapper = hoverPill?.wrapper ?? null
  const updateHoverPillPosition = useCallback(() => {
    setHoverPill((prev) => {
      if (!prev) return null
      const updated = computeHoverPill(prev.cell, prev.wrapper)
      return updated
    })
  }, [])

  useEffect(() => {
    if (!hoverWrapper) return
    hoverWrapper.addEventListener('scroll', updateHoverPillPosition)
    window.addEventListener('scroll', updateHoverPillPosition, true)
    window.addEventListener('resize', updateHoverPillPosition)
    return () => {
      hoverWrapper.removeEventListener('scroll', updateHoverPillPosition)
      window.removeEventListener('scroll', updateHoverPillPosition, true)
      window.removeEventListener('resize', updateHoverPillPosition)
    }
  }, [hoverWrapper, updateHoverPillPosition])

  // Don't show hover pill when there's already a selection pill
  const showHoverPill = hoverPill && !pillState

  if (!pillState && !menuState && !showHoverPill) return null

  const actions = menuState ? (menuState.actions ?? getActionsForType(menuState.type)) : []

  let menuTop = 0
  let menuLeft = 0
  let transform: string | undefined

  if (menuState && actions.length > 0) {
    const { triggerRect, type } = menuState
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
  }

  return (
    <>
      {showHoverPill &&
        [hoverPill.row, hoverPill.col]
          .filter((p): p is SinglePillInfo => p !== null)
          .map((pill) =>
            createPortal(
              <HoverPillButton
                key={pill.type}
                pill={pill}
                hoverPill={hoverPill}
                editor={editor}
                hoverPillHoveredRef={hoverPillHoveredRef}
                hoverCellRef={hoverCellRef}
                setHoverPill={setHoverPill}
                setMenuState={setMenuState}
              />,
              document.body,
            ),
          )}
      {pillState?.pos &&
        createPortal(
          <button
            type="button"
            className={pillState.type === 'table' ? CONTEXTUAL_MENU_CLASS : TRIGGER_CLASS}
            aria-label={`${pillState.type} actions`}
            style={{
              position: 'fixed',
              top: pillState.pos.top,
              left: pillState.pos.left,
              width: pillState.pos.width,
              height: pillState.pos.height,
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMenuState({
                type: pillState.type,
                triggerRect: e.currentTarget.getBoundingClientRect(),
              })
            }}
          >
            {pillState.type === 'column' ? (
              <EllipsisH />
            ) : (
              <EllipsisV fill={pillState.type === 'table' ? '#637381' : 'white'} />
            )}
          </button>,
          document.body,
        )}
      {menuState && actions.length > 0 && (
        <TableActionDropdown
          actions={actions}
          editor={editor}
          top={menuTop}
          left={menuLeft}
          transform={transform}
          onClose={closeMenu}
        />
      )}
    </>
  )
}
