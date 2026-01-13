'use client'

import type { Editor } from '@tiptap/react'
import type React from 'react'
import { useEffect, useMemo, useRef } from 'react'
import tippy, { type Instance, type Props } from 'tippy.js'

type CustomBubbleMenuProps = {
  editor: Editor
  open: boolean
  children: React.ReactNode
  placement?: Props['placement']
  offset?: Props['offset']
  id: string
}

export function BubbleMenu({
  editor,
  open,
  children,
  placement = 'top-start',
  offset = [0, 4],
  id,
}: CustomBubbleMenuProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const tippyRef = useRef<Instance<Props> | null>(null)

  // Each instance gets its OWN content root so nothing is shared
  const contentRootRef = useRef<HTMLDivElement | null>(null)
  if (!contentRootRef.current && typeof document !== 'undefined') {
    contentRootRef.current = document.createElement('div')
    contentRootRef.current.setAttribute('data-custom-bubblemenu', id)
  }

  const getReferenceClientRect = useMemo(() => {
    return () => {
      const { state, view } = editor
      const { from, to } = state.selection
      const pos = from === to ? from : to

      try {
        const start = view.coordsAtPos(pos)
        return {
          width: 0,
          height: 0,
          top: start.top,
          bottom: start.bottom,
          left: start.left,
          right: start.left,
          x: start.left,
          y: start.top,
        } as DOMRect
      } catch {
        return view.dom.getBoundingClientRect()
      }
    }
  }, [editor])

  // Create ONE tippy instance for this component instance
  useEffect(() => {
    if (!anchorRef.current) return
    if (!contentRootRef.current) return
    if (tippyRef.current) return

    const instance = tippy(anchorRef.current, {
      trigger: 'manual',
      interactive: true,
      appendTo: () => document.body,
      placement,
      offset,
      getReferenceClientRect,
      // IMPORTANT: unique DOM node per instance
      content: contentRootRef.current,
      popperOptions: { strategy: 'fixed' },
      duration: 0,
      // Optional: prevents “one opens and another closes unexpectedly”
      // because of focus/blur behavior in some setups.
      hideOnClick: false,
    })

    tippyRef.current = instance

    return () => {
      instance.destroy()
      tippyRef.current = null
    }
  }, [placement, offset, getReferenceClientRect])

  // Keep position updated
  useEffect(() => {
    const update = () => {
      const inst = tippyRef.current
      if (!inst) return
      if (inst.state.isShown) inst.popperInstance?.update()
    }

    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    editor.on('update', update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)

    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
      editor.off('update', update)
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [editor])

  // Hard show/hide
  useEffect(() => {
    const inst = tippyRef.current
    if (!inst) return

    if (open) {
      editor.commands.focus()
      inst.show()
      queueMicrotask(() => inst.popperInstance?.update())
    } else {
      inst.hide()
    }
  }, [open, editor])

  // Mount React children into the unique content root
  // We do it by rendering a portal.
  // (This is the cleanest way to avoid shared DOM conflicts.)
  return (
    <>
      <span ref={anchorRef} style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true" />

      {contentRootRef.current ? require('react-dom').createPortal(children, contentRootRef.current) : null}
    </>
  )
}
