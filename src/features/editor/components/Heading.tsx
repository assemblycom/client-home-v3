'use client'

import { MinimalEditor } from '@editor/components/Editor/MinimalEditor'
import { isBlankContent } from '@editor/utils/content'
import { useSettingsStore } from '@settings/providers/settings.provider'
import type { PropsWithClassname } from '@/app/types'
import { cn } from '@/utils/tailwind'

interface HeadingProps extends PropsWithClassname {
  readonly?: boolean
}

export const Heading = ({ readonly, className }: HeadingProps) => {
  const heading = useSettingsStore((s) => s.heading)
  const setHeading = useSettingsStore((s) => s.setHeading)

  if (readonly && isBlankContent(heading)) return null

  return (
    <MinimalEditor
      value={heading}
      onChange={setHeading}
      editable={!readonly}
      placeholder="Heading"
      className={cn('font-medium text-custom-xl leading-7', className)}
    />
  )
}
