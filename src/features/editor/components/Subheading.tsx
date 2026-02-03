'use client'

import { useSettingsStore } from '@settings/providers/settings.provider'
import type { PropsWithClassname } from '@/app/types'
import { cn } from '@/utils/tailwind'

interface SubheadingProps extends PropsWithClassname {
  readonly?: boolean
}

export const Subheading = ({ readonly, className }: SubheadingProps) => {
  const subheading = useSettingsStore((s) => s.subheading)
  const setSubheading = useSettingsStore((s) => s.setSubheading)

  if (readonly) {
    if (!subheading) return null
    return <div className={cn('pt-2 text-sm text-text-secondary leading-5.5', className)}>{subheading}</div>
  }

  return (
    <div className={cn('pt-2', className)}>
      <input
        type="text"
        id="subheading"
        placeholder="Subheader"
        value={subheading}
        onChange={(e) => setSubheading(e.target.value)}
        className={'block w-full border-none text-sm text-text-secondary leading-5.5 outline-none'}
      />
    </div>
  )
}
