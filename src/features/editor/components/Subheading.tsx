'use client'

import { MinimalEditor } from '@editor/components/Editor/MinimalEditor'
import { isBlankContent } from '@editor/utils/content'
import { useSettingsStore } from '@settings/providers/settings.provider'
import type { PropsWithClassname } from '@/app/types'
import { cn } from '@/utils/tailwind'

interface SubheadingProps extends PropsWithClassname {
  readonly?: boolean
}

export const Subheading = ({ readonly, className }: SubheadingProps) => {
  const subheading = useSettingsStore((s) => s.subheading)
  const setSubheading = useSettingsStore((s) => s.setSubheading)
  const syncCanonicalContent = useSettingsStore((s) => s.syncCanonicalContent)

  if (readonly && isBlankContent(subheading)) return null

  return (
    <MinimalEditor
      value={subheading}
      onChange={setSubheading}
      onNormalize={(value) => syncCanonicalContent('subheading', value)}
      editable={!readonly}
      placeholder="Subheader"
      className={cn('text-sm text-text-secondary leading-5.5 dark-bg:text-white/70', className)}
    />
  )
}
