'use client'

import { useSettingsStore } from '@settings/providers/settings.provider'

export const Subheading = () => {
  const subheading = useSettingsStore((s) => s.subheading)
  const setSubheading = useSettingsStore((s) => s.setSubheading)

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
