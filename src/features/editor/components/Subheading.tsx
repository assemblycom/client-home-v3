'use client'

import { useSettingsStore } from '@settings/providers/settings.provider'

interface SubheadingProps {
  readonly?: boolean
}

export const Subheading = ({ readonly }: SubheadingProps) => {
  const subheading = useSettingsStore((s) => s.subheading)
  const setSubheading = useSettingsStore((s) => s.setSubheading)

  if (readonly) {
    if (!subheading) return null
    return <div className="pt-2 text-sm text-text-secondary leading-5.5">{subheading}</div>
  }

  return (
    <div className="pt-2">
      <input
        type="text"
        id="subheading"
        placeholder="Subheader"
        value={subheading}
        onChange={(e) => setSubheading(e.target.value)}
        className="w-full border-none text-sm text-text-secondary leading-5.5 outline-none"
      />
    </div>
  )
}
