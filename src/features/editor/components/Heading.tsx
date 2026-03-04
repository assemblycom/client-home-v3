'use client'

import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useMemo } from 'react'
import type { PropsWithClassname } from '@/app/types'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { getTimeOfDay } from '@/utils/date'
import { cn } from '@/utils/tailwind'

interface HeadingProps extends PropsWithClassname {
  readonly?: boolean
}

export const Heading = ({ readonly, className }: HeadingProps) => {
  const viewMode = useViewStore((s) => s.viewMode)
  const greeting = useMemo(() => getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1), [])

  const isPreviewMode = readonly || viewMode === ViewMode.PREVIEW

  return (
    <div className={cn('flex font-medium text-custom-xl leading-7', className)}>
      <div suppressHydrationWarning>Good {greeting},&nbsp;</div>
      <HandleBarTemplate
        template="{{client.firstName}}"
        mode={isPreviewMode ? ViewMode.PREVIEW : ViewMode.EDITOR}
        fallbackValue="User"
      />
    </div>
  )
}
