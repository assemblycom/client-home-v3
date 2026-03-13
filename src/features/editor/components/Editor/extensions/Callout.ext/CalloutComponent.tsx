import { Icon } from '@assembly-js/design-system'
import type { CalloutOptions } from '@extensions/Callout.ext'
import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback } from 'react'

interface CalloutProps extends NodeViewProps {
  extension: NodeViewProps['extension'] & {
    options: CalloutOptions
  }
}

export const Callout = ({ editor, node, extension, getPos }: CalloutProps) => {
  const handleDelete = useCallback(() => {
    const pos = getPos()
    if (pos === undefined) return
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run()
  }, [editor, node, getPos])

  return (
    <NodeViewWrapper className={`${extension.options.wrapperClass} group/callout relative`}>
      {editor.isEditable && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-1.5 right-1.5 z-10 cursor-pointer rounded-[3px] bg-white p-[3px] opacity-0 shadow-sm transition-opacity group-hover/callout:opacity-100 dark:bg-white/20"
          aria-label="Remove callout"
        >
          <Icon icon="Close" width={10} height={10} />
        </button>
      )}
      <NodeViewContent className={extension.options.contentClass} />
    </NodeViewWrapper>
  )
}
