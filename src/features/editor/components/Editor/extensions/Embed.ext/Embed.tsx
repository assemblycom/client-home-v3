import type { EmbedOptions } from '@extensions/Embed.ext'
import { ResizeBar } from '@extensions/Embed.ext/ResizeBar'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useRef } from 'react'

interface EmbedProps extends NodeViewProps {
  extension: NodeViewProps['extension'] & {
    options: EmbedOptions
  }
}

export const Embed = (props: EmbedProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const el = containerRef.current
      const parentEl = parentRef.current
      if (!el || !parentEl) return

      isDraggingRef.current = true

      const startW = el.clientWidth
      const startH = el.clientHeight
      const startX = event.clientX
      const startY = event.clientY

      // Avoid iframe stealing pointer events while dragging
      el.style.pointerEvents = 'none'
      document.body.style.userSelect = 'none'

      const onMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return

        const nextW = Math.max(100, startW + (e.clientX - startX))
        const nextH = Math.max(60, startH + (e.clientY - startY))

        // Do not allow iframe to exceed parent width.
        // Exceeding parent height is okay.
        if (nextW >= parentEl.clientWidth) return

        // IMPORTANT: Throttle DOM writes to one per animation frame
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          el.style.width = `${nextW}px`
          el.style.height = `${nextH}px`
        })
      }

      const onUp = () => {
        isDraggingRef.current = false

        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null

        // restore
        el.style.pointerEvents = ''
        document.body.style.userSelect = ''

        // Commit final size to TipTap once only
        const finalW = el.getBoundingClientRect().width
        const finalH = el.getBoundingClientRect().height
        props.updateAttributes({
          width: Math.round(finalW),
          height: Math.round(finalH),
        })

        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [props.updateAttributes],
  )

  function extractIframeSrc(inputString: string) {
    const iframeSrcRegex = /<iframe.*?src=["']([^"']+)["'][^>]*><\/iframe>/
    const match = inputString.match(iframeSrcRegex)
    return match ? match[1] : inputString
  }

  const isReadonly = false

  return (
    <NodeViewWrapper ref={parentRef}>
      <div className="embed group relative inline-block">
        <div
          ref={containerRef}
          className="embed__container"
          style={{
            height: props.node.attrs.height,
            width: props.node.attrs.width,
          }}
        >
          <iframe
            title="Client Home embed"
            src={extractIframeSrc(props.node.attrs.src)}
            width="100%"
            height="100%"
            onError={(e) => {
              e.stopPropagation()
              console.info('[iframe error]:', e)
            }}
          />
        </div>

        {!isReadonly && (
          <ResizeBar
            onMouseDown={handleMouseDown}
            className="opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
          />
        )}
      </div>
    </NodeViewWrapper>
  )
}
