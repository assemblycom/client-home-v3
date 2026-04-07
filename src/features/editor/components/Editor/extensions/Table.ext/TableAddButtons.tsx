'use client'

import type { Editor } from '@tiptap/react'
import { useEffect } from 'react'

const BUTTON_CLASS_ROW = 'table-add-row-btn'
const BUTTON_CLASS_COL = 'table-add-col-btn'

const createButton = (className: string, ariaLabel: string): HTMLButtonElement => {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = className
  btn.setAttribute('aria-label', ariaLabel)
  btn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  return btn
}

const updateButtonPositions = (wrapper: HTMLElement) => {
  const table = wrapper.querySelector('table')
  const colBtn = wrapper.querySelector<HTMLElement>(`.${BUTTON_CLASS_COL}`)
  const rowBtn = wrapper.querySelector<HTMLElement>(`.${BUTTON_CLASS_ROW}`)
  if (!table) return
  const tableWidth = table.offsetWidth
  if (colBtn) colBtn.style.left = `${tableWidth + 4}px`
  if (rowBtn) rowBtn.style.width = `${tableWidth}px`
}

const SCROLLING_CLASS = 'is-scrolling'

export const TableAddButtons = ({ editor }: { editor: Editor }) => {
  useEffect(() => {
    const editorDOM = editor.view.dom
    const scrollTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()

    const handleScroll = (wrapper: HTMLElement) => {
      wrapper.classList.add(SCROLLING_CLASS)
      const existing = scrollTimers.get(wrapper)
      if (existing) clearTimeout(existing)
      scrollTimers.set(
        wrapper,
        setTimeout(() => {
          wrapper.classList.remove(SCROLLING_CLASS)
          scrollTimers.delete(wrapper)
        }, 150),
      )
    }

    const scrollListeners = new Map<HTMLElement, () => void>()

    const ensureButtons = () => {
      const wrappers = editorDOM.querySelectorAll<HTMLElement>('.tableWrapper')
      for (const wrapper of wrappers) {
        if (!scrollListeners.has(wrapper)) {
          const listener = () => handleScroll(wrapper)
          wrapper.addEventListener('scroll', listener)
          scrollListeners.set(wrapper, listener)
        }

        if (!wrapper.querySelector(`.${BUTTON_CLASS_ROW}`)) {
          const rowBtn = createButton(BUTTON_CLASS_ROW, 'Add row')
          rowBtn.addEventListener('mousedown', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const table = wrapper.querySelector('table')
            if (table) {
              const lastCell = table.querySelector('tr:last-child td:last-child, tr:last-child th:last-child')
              if (lastCell) {
                const pos = editor.view.posAtDOM(lastCell, 0)
                editor.chain().focus(pos).addRowAfter().run()
              }
            }
          })
          wrapper.appendChild(rowBtn)
        }
        if (!wrapper.querySelector(`.${BUTTON_CLASS_COL}`)) {
          const colBtn = createButton(BUTTON_CLASS_COL, 'Add column')
          colBtn.addEventListener('mousedown', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const table = wrapper.querySelector('table')
            if (table) {
              const lastHeaderCell = table.querySelector('tr:first-child th:last-child, tr:first-child td:last-child')
              if (lastHeaderCell) {
                const pos = editor.view.posAtDOM(lastHeaderCell, 0)
                editor.chain().focus(pos).addColumnAfter().run()
              }
            }
          })
          wrapper.appendChild(colBtn)
        }
        updateButtonPositions(wrapper)
      }
    }

    ensureButtons()
    editor.on('transaction', ensureButtons)

    const resizeObserver = new ResizeObserver(() => {
      const wrappers = editorDOM.querySelectorAll<HTMLElement>('.tableWrapper')
      for (const wrapper of wrappers) {
        updateButtonPositions(wrapper)
      }
    })
    resizeObserver.observe(editorDOM)

    return () => {
      editor.off('transaction', ensureButtons)
      resizeObserver.disconnect()
      for (const [wrapper, listener] of scrollListeners) {
        wrapper.removeEventListener('scroll', listener)
      }
      scrollListeners.clear()
      for (const timer of scrollTimers.values()) {
        clearTimeout(timer)
      }
      scrollTimers.clear()
    }
  }, [editor])

  return null
}
