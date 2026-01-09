import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'

export type CalloutOptions = {
  wrapperClass?: string
  contentClass?: string
}

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
