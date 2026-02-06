import { ViewMode } from '@editor/stores/viewStore'
import type { ReactNode } from 'react'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'
import { getTemplateValue } from '@/features/handlebar-template/utils/get-template-value'
import { cn } from '@/utils/tailwind'

interface HandleBarTemplateProps {
  template: TemplateString
  mode: ViewMode
  fallbackValue?: ReactNode
  isLoading?: boolean
  className?: string
}

export function HandleBarTemplate({ template, mode, fallbackValue, isLoading, className }: HandleBarTemplateProps) {
  if (mode === ViewMode.EDITOR) {
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
          <span className="line-clamp-1 text-ellipsis break-all">{template}</span>
        </div>
      </span>
    )
  }

  return <span className={className}>{getTemplateValue(template, fallbackValue)}</span>
}
