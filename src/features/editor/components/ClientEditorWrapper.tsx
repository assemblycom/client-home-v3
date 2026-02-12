'use client'

import { useSettingsStore } from '@settings/providers/settings.provider'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Heading } from './Heading'
import { Subheading } from './Subheading'

export const ClientEditorWrapper = ({ content }: { content: string }) => {
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)

  return (
    <div className={`@container min-h-full w-full overflow-auto px-12 py-11`} style={{ backgroundColor }}>
      <Heading />
      <Subheading readonly />
      <ActionsCard readonly />
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: <allow inner html> */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
