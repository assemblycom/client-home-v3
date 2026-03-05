'use client'

import { getFieldDisplayContent } from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { useViewStore } from '@editor/stores/viewStore'
import { useMemo } from 'react'
import type { PropsWithClassname } from '@/app/types'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { getTimeOfDay } from '@/utils/date'
import { cn } from '@/utils/tailwind'

const TEMPLATE = '{{client.firstName}}' as const

export const Heading = ({ className }: PropsWithClassname) => {
  const greeting = useMemo(() => getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1), [])
  const viewMode = useViewStore((s) => s.viewMode)
  const workspace = useViewStore((s) => s.workspace)
  const displayContent = getFieldDisplayContent(TEMPLATE, workspace?.labels)

  return (
    <div className={cn('flex font-medium text-custom-xl leading-7', className)}>
      <div suppressHydrationWarning>Good {greeting},&nbsp;</div>
      <span>
        <HandleBarTemplate
          template={TEMPLATE}
          displayContent={displayContent !== TEMPLATE ? displayContent : undefined}
          mode={viewMode}
        />
      </span>
    </div>
  )
}
