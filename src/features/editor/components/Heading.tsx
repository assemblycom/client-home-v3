'use client'

import { getFieldDisplayContent } from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useMemo } from 'react'
import type { PropsWithClassname } from '@/app/types'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { getTimeOfDay } from '@/utils/date'
import { cn } from '@/utils/tailwind'

const TEMPLATE = '{{client.firstName}}' as const

interface HeadingProps extends PropsWithClassname {
  readonly?: boolean
}

export const Heading = ({ readonly, className }: HeadingProps) => {
  const greeting = useMemo(() => getTimeOfDay(), [])

  const viewMode = useViewStore((s) => s.viewMode)
  const workspace = useViewStore((s) => s.workspace)
  const displayContent = getFieldDisplayContent(TEMPLATE, workspace?.labels)
  const isPreviewMode = readonly || viewMode === ViewMode.PREVIEW

  return (
    <div className={cn('flex flex-wrap items-baseline font-medium text-custom-xl leading-7', className)}>
      <div className="capitalize" suppressHydrationWarning>
        Good {greeting},&nbsp;
      </div>
      <span>
        <HandleBarTemplate
          template={TEMPLATE}
          displayContent={displayContent !== TEMPLATE ? displayContent : undefined}
          mode={isPreviewMode ? ViewMode.PREVIEW : ViewMode.EDITOR}
        />
      </span>
    </div>
  )
}
