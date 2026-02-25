'use client'

import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useUsersStore } from '@users/stores/usersStore'
import type { ReactNode } from 'react'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'
import { resolveTemplate } from '@/features/handlebar-template/utils/resolve-template'
import { cn } from '@/utils/tailwind'

interface HandleBarTemplateProps {
  template: TemplateString
  /**
   * Optional display label shown in editor mode.
   * Useful when workspace labels remap the canonical prefix
   * (e.g. `{{person.firstName}}` instead of `{{client.firstName}}`).
   * Falls back to `template` when not provided.
   */
  displayContent?: string
  mode: ViewMode
  fallbackValue?: ReactNode
  isLoading?: boolean
  className?: string
}

export function HandleBarTemplate({
  template,
  displayContent,
  mode,
  fallbackValue,
  isLoading,
  className,
}: HandleBarTemplateProps) {
  const workspace = useViewStore((s) => s.workspace)
  const previewClient = useUsersStore((s) => s.previewClient)
  const previewCompany = useUsersStore((s) => s.previewCompany)

  if (mode === ViewMode.EDITOR) {
    const label = displayContent ?? template
    return (
      <span className="inline-flex align-baseline">
        <div
          title={template}
          className={cn(
            'relative inline-block w-fit max-w-full justify-center overflow-clip rounded-lg border border-border-gray bg-white px-2 font-normal text-sm text-text-secondary transition-all',
            isLoading && 'border-transparent text-transparent',
            className,
          )}
        >
          {isLoading && <span className="absolute size-full animate-pulse bg-gray-200" />}
          <span className="line-clamp-1 text-ellipsis break-all">{label}</span>
        </div>
      </span>
    )
  }

  const resolved = resolveTemplate(template, previewClient, previewCompany, workspace)
  return <span className={className}>{resolved || fallbackValue}</span>
}
