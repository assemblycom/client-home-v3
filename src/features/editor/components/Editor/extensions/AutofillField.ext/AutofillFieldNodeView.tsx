'use client'

import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useUsersStore } from '@users/stores/usersStore'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'
import { getFieldDisplayContent } from './autofill-fields.config'

export const AutofillFieldNodeView = ({ node, editor }: NodeViewProps) => {
  const viewMode = editor.isEditable ? ViewMode.EDITOR : ViewMode.PREVIEW
  const workspace = useViewStore((store) => store.workspace)
  const previewClient = useUsersStore((store) => store.previewClient)

  // In preview mode, show a skeleton until the client data has been loaded into the store
  const isLoading = viewMode === ViewMode.PREVIEW && previewClient === null

  const value = node.attrs.value as string
  const displayContent = getFieldDisplayContent(value, workspace?.labels)

  return (
    <NodeViewWrapper as="span" className="inline-flex align-baseline">
      <HandleBarTemplate
        template={value as TemplateString}
        displayContent={displayContent}
        mode={viewMode}
        isLoading={isLoading}
      />
    </NodeViewWrapper>
  )
}
