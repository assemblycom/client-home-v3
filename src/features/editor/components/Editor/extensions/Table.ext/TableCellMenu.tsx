'use client'

import { Icon } from '@assembly-js/design-system'
import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getActiveCellDOM, getCellKey } from './table-utils'

export type TableAction = {
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

// --- Reusable dropdown menu ---

export const TableActionDropdown = ({
  actions,
  editor,
  top,
  left,
  transform,
  onClose,
}: {
  actions: TableAction[]
  editor: Editor
  top: number
  left: number
  transform?: string
  onClose: () => void
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  return createPortal(
    <div
      ref={dropdownRef}
      role="menu"
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        top,
        left,
        transform,
        zIndex: 50,
      }}
      className="min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onClose()
            action.command(editor)
          }}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 ${
            action.isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
          }`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>,
    document.body,
  )
}

// --- Cell menu (original) ---

export const TableCellMenu = ({ editor }: { editor: Editor }) => {
  const [cellDOM, setCellDOM] = useState<HTMLElement | null>(null)
  const [cellRect, setCellRect] = useState<DOMRect | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
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

  // Close on click outside trigger
  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      // Let the dropdown's own click-outside handle closing
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  if (!cellDOM || !cellRect) return null

  const triggerTop = cellRect.top + 4
  const triggerLeft = cellRect.right - 24

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

      {isOpen && (
        <TableActionDropdown
          actions={TABLE_ACTIONS}
          editor={editor}
          top={triggerTop + 24}
          left={triggerLeft}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>,
    document.body,
  )
}
