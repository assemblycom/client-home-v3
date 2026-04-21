import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { CellSelection, cellAround, tableEditingKey } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

const LONG_PRESS_MS = 400
const MOVE_TOLERANCE = 8
const AUTO_SCROLL_ZONE = 40
const AUTO_SCROLL_SPEED = 12

/**
 * Enables touch-based table cell selection via long-press + drag.
 *
 * Flow:
 * 1. User long-presses a cell (~400ms hold without moving) → cell is selected
 * 2. While still holding, drag to extend selection across cells
 * 3. When dragging near the wrapper edge, auto-scrolls to reveal more cells
 * 4. Normal quick swipes still scroll as expected
 */
export const TableTouchSelection = Extension.create({
  name: 'tableTouchSelection',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            touchstart(view, event) {
              if (event.touches.length !== 1) return false

              const touch = event.touches[0]
              const target = touch.target as HTMLElement
              const startCell = domInCell(view.dom, target)
              if (!startCell) return false

              const $anchorInit = cellAtCoords(view, touch.clientX, touch.clientY)
              if (!$anchorInit) return false

              // Store the numeric position so we can re-resolve against the
              // current document on every move. Holding onto a ResolvedPos from
              // an earlier doc causes "Selection … must point at the current
              // document" when the state has changed between events.
              const anchorPos = $anchorInit.pos

              const wrapper = startCell.closest('.tableWrapper') as HTMLElement | null
              const startX = touch.clientX
              const startY = touch.clientY
              let activated = false
              let scrollRaf = 0

              // After LONG_PRESS_MS of holding still, enter selection mode
              const timer = setTimeout(() => {
                activated = true

                // Select the anchor cell to give visual feedback
                const selection = CellSelection.create(view.state.doc, anchorPos)
                const tr = view.state.tr.setSelection(selection)
                tr.setMeta(tableEditingKey, anchorPos)
                view.dispatch(tr)
              }, LONG_PRESS_MS)

              const move = (e: TouchEvent) => {
                const t = e.touches[0]
                if (!t) return

                if (!activated) {
                  // If finger moves too far before long-press fires, cancel — user is scrolling
                  const dx = t.clientX - startX
                  const dy = t.clientY - startY
                  if (dx * dx + dy * dy > MOVE_TOLERANCE * MOVE_TOLERANCE) {
                    clearTimeout(timer)
                    cleanup()
                  }
                  return
                }

                // Selection mode is active — prevent scrolling
                if (e.cancelable) e.preventDefault()

                const $head = cellAtCoords(view, t.clientX, t.clientY)
                if ($head) {
                  // Re-resolve anchor from the current document so both
                  // positions belong to the same doc instance. anchorPos
                  // already points before the cell, so no cellAround wrap.
                  const $anchor = view.state.doc.resolve(anchorPos)
                  const selection = new CellSelection($anchor, $head)
                  if (!view.state.selection.eq(selection)) {
                    const tr = view.state.tr.setSelection(selection)
                    if (tableEditingKey.getState(view.state) == null) {
                      tr.setMeta(tableEditingKey, anchorPos)
                    }
                    view.dispatch(tr)
                  }
                }

                // Auto-scroll the table wrapper when dragging near its edges
                if (wrapper) {
                  autoScroll(wrapper, t.clientX, t.clientY, (scrolled) => {
                    if (!scrolled) {
                      cancelAnimationFrame(scrollRaf)
                      scrollRaf = 0
                      return
                    }
                    // After scrolling, re-evaluate cell under finger
                    const $newHead = cellAtCoords(view, t.clientX, t.clientY)
                    if ($newHead) {
                      const $anchor = view.state.doc.resolve(anchorPos)
                      const sel = new CellSelection($anchor, $newHead)
                      if (!view.state.selection.eq(sel)) {
                        view.dispatch(view.state.tr.setSelection(sel))
                      }
                    }
                  })
                }
              }

              const cleanup = () => {
                clearTimeout(timer)
                cancelAnimationFrame(scrollRaf)
                view.dom.removeEventListener('touchmove', move)
                view.dom.removeEventListener('touchend', cleanup)
                view.dom.removeEventListener('touchcancel', cleanup)
                if (tableEditingKey.getState(view.state) != null) {
                  view.dispatch(view.state.tr.setMeta(tableEditingKey, -1))
                }
              }

              view.dom.addEventListener('touchmove', move, { passive: false })
              view.dom.addEventListener('touchend', cleanup)
              view.dom.addEventListener('touchcancel', cleanup)

              return false
            },
          },
        },
      }),
    ]
  },
})

const domInCell = (editorDom: HTMLElement, dom: HTMLElement | null): HTMLElement | null => {
  for (let el: HTMLElement | null = dom; el && el !== editorDom; el = el.parentElement) {
    if (el.nodeName === 'TD' || el.nodeName === 'TH') return el
  }
  return null
}

const cellAtCoords = (view: EditorView, x: number, y: number) => {
  const pos = view.posAtCoords({ left: x, top: y })
  if (!pos) return null
  const { inside, pos: p } = pos
  return (inside >= 0 && cellAround(view.state.doc.resolve(inside))) || cellAround(view.state.doc.resolve(p))
}

const autoScroll = (wrapper: HTMLElement, touchX: number, touchY: number, onScroll: (scrolled: boolean) => void) => {
  const rect = wrapper.getBoundingClientRect()

  let dx = 0
  let dy = 0

  if (touchX < rect.left + AUTO_SCROLL_ZONE) {
    dx = -AUTO_SCROLL_SPEED
  } else if (touchX > rect.right - AUTO_SCROLL_ZONE) {
    dx = AUTO_SCROLL_SPEED
  }

  if (touchY < rect.top + AUTO_SCROLL_ZONE) {
    dy = -AUTO_SCROLL_SPEED
  } else if (touchY > rect.bottom - AUTO_SCROLL_ZONE) {
    dy = AUTO_SCROLL_SPEED
  }

  if (dx === 0 && dy === 0) {
    onScroll(false)
    return
  }

  wrapper.scrollBy(dx, dy)
  onScroll(true)
}
