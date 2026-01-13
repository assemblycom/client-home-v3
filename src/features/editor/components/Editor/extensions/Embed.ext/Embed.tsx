import type { EmbedOptions } from '@extensions/Embed.ext'
import { ResizeBar } from '@extensions/Embed.ext/ResizeBar'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback } from 'react'
import { debounce } from '@/utils/debounce'

interface EmbedProps extends NodeViewProps {
  extension: NodeViewProps['extension'] & {
    options: EmbedOptions
  }
}

export const Embed = (props: EmbedProps) => {
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const parent = event.currentTarget.closest('.embed')
      const image = parent?.querySelector('div.embed__container')
      if (!image) return

      const startSize = { x: image.clientWidth, y: image.clientHeight }
      const startPosition = { x: event.pageX, y: event.pageY }

      const onMouseMove = debounce((mouseMoveEvent: MouseEvent) => {
        props.updateAttributes({
          width: startSize.x - startPosition.x + mouseMoveEvent.pageX,
          height: startSize.y - startPosition.y + mouseMoveEvent.pageY,
        })
      }, 10)

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [props.updateAttributes],
  )

  function extractIframeSrc(inputString: string) {
    // Regular expression to match the src attribute of an iframe tag
    const iframeSrcRegex = /<iframe.*?src=["']([^"']+)["'][^>]*><\/iframe>/

    const match = inputString.match(iframeSrcRegex)
    if (match) {
      return match[1]
    } else {
      return inputString
    }
  }

  const isReadonly = false

  return (
    <NodeViewWrapper
      className="embed group relative inline-block"
      style={{
        height: props.node.attrs.height,
        width: props.node.attrs.width,
      }}
    >
      <div className="embed__container h-full w-full">
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
    </NodeViewWrapper>
  )
}
