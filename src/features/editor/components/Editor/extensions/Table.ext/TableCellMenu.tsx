'use client'

import type { Editor } from '@tiptap/react'
import { Icon } from 'copilot-design-system'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TableAction = {
  label: string
  icon: React.ReactNode
  command: (editor: Editor) => void
  isDanger?: boolean
}

const TABLE_ACTIONS: TableAction[] = [
  {
    label: 'Add row above',
    icon: <Icon icon="ArrowUpSolid" width={16} height={16} />,
    command: (editor) => editor.chain().focus().addRowBefore().run(),
  },
  {
    label: 'Add row below',
    icon: <Icon icon="ArrowDownSolid" width={16} height={16} />,
    command: (editor) => editor.chain().focus().addRowAfter().run(),
  },
  {
    label: 'Add column before',
    icon: <Icon icon="ArrowLeft" width={16} height={16} />,
    command: (editor) => editor.chain().focus().addColumnBefore().run(),
  },
  {
    label: 'Add column after',
    icon: <Icon icon="ArrowRight" width={16} height={16} />,
    command: (editor) => editor.chain().focus().addColumnAfter().run(),
  },
  {
    label: 'Remove row',
    icon: <Icon icon="Minus" width={16} height={16} />,
    command: (editor) => editor.chain().focus().deleteRow().run(),
    isDanger: true,
  },
  {
    label: 'Remove column',
    icon: <Icon icon="Minus" width={16} height={16} />,
    command: (editor) => editor.chain().focus().deleteColumn().run(),
    isDanger: true,
  },
  {
    label: 'Remove table',
    icon: <Icon icon="Trash" width={16} height={16} />,
    command: (editor) => editor.chain().focus().deleteTable().run(),
    isDanger: true,
  },
]

const getActiveCellDOM = (editor: Editor): HTMLElement | null => {
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

// Unique key per cell DOM element so React unmounts/remounts instead of animating
let cellKeyCounter = 0
const cellKeyMap = new WeakMap<HTMLElement, number>()
const getCellKey = (cell: HTMLElement): number => {
  let key = cellKeyMap.get(cell)
  if (key === undefined) {
    key = cellKeyCounter++
    cellKeyMap.set(cell, key)
  }
  return key
}

export const TableCellMenu = ({ editor }: { editor: Editor }) => {
  const [cellDOM, setCellDOM] = useState<HTMLElement | null>(null)
  const [cellRect, setCellRect] = useState<DOMRect | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevCellRef = useRef<HTMLElement | null>(null)

  const updatePosition = useCallback(() => {
    if (!editor.isEditable) {
      setCellDOM(null)
      setCellRect(null)
      return
    }
    const cell = getActiveCellDOM(editor)
    if (cell !== prevCellRef.current) {
      setIsOpen(false)
      prevCellRef.current = cell
    }
    setCellDOM(cell)
    setCellRect(cell ? cell.getBoundingClientRect() : null)
  }, [editor])

  useEffect(() => {
    updatePosition()
    editor.on('selectionUpdate', updatePosition)
    editor.on('transaction', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('transaction', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [editor, updatePosition])

  // Close on click outside (check both trigger and dropdown)
  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  const handleAction = (action: TableAction) => {
    setIsOpen(false)
    action.command(editor)
  }

  if (!cellDOM || !cellRect) return null

  const triggerTop = cellRect.top + 4
  const triggerLeft = cellRect.right - 24
  const dropdownTop = triggerTop + 24
  const dropdownLeft = triggerLeft

  return createPortal(
    <div key={getCellKey(cellDOM)}>
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        style={{
          position: 'fixed',
          top: triggerTop,
          left: triggerLeft,
          zIndex: 20,
        }}
        className="flex h-5 w-5 items-center justify-center rounded border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
        aria-label="Table cell options"
      >
        <Icon icon="ChevronDown" width={12} height={12} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          onMouseDown={(e) => {
            e.preventDefault()
          }}
          style={{
            position: 'fixed',
            top: dropdownTop,
            left: dropdownLeft,
            zIndex: 50,
          }}
          className="min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {TABLE_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleAction(action)
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                action.isDanger ? 'text-red-600 hover:bg-red-50' : 'text-fg-primary'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}
