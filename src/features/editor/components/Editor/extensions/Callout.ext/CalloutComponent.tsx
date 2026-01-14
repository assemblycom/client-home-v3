import type { CalloutOptions } from '@extensions/Callout.ext'
import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'

interface CalloutProps extends NodeViewProps {
  extension: NodeViewProps['extension'] & {
    options: CalloutOptions
  }
}

export const Callout = ({ extension }: CalloutProps) => {
  return (
    <NodeViewWrapper className={extension.options.wrapperClass}>
      <NodeViewContent className={extension.options.contentClass} />
    </NodeViewWrapper>
  )
}
