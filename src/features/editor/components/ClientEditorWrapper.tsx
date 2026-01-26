'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { useSettingsStore } from '@settings/providers/settings.provider'

export const ClientEditorWrapper = () => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)

  return (
    <div className={`min-h-full w-full overflow-auto px-12 py-11`} style={{ backgroundColor }}>
      <ReadonlyEditor token={token} content={content} />
    </div>
  )
}
