'use client'

import { useViewStore } from '@editor/stores/viewStore'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'
import { getFieldDisplayContent } from './autofill-fields.config'

export const AutofillFieldNodeView = ({ node }: NodeViewProps) => {
  const viewMode = useViewStore((store) => store.viewMode)
  const workspace = useViewStore((store) => store.workspace)

  const value = node.attrs.value as string
  const displayContent = getFieldDisplayContent(value, workspace?.labels)

  return (
    <NodeViewWrapper as="span" className="inline-flex align-baseline">
      <HandleBarTemplate template={value as TemplateString} displayContent={displayContent} mode={viewMode} />
    </NodeViewWrapper>
  )
}
