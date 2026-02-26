'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { useViewStore } from '@editor/stores/viewStore'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useQuery } from '@tanstack/react-query'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { api } from '@/lib/core/axios.instance'
import { Heading } from './Heading'
import { Subheading } from './Subheading'

export const ClientEditorWrapper = () => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const setTasksAppId = useViewStore((store) => store.setTasksAppId)

  useQuery({
    queryKey: ['tasks-app-id'],
    queryFn: async (): Promise<string> => {
      const res = await api.get<{ data: string }>(`/api/workspace/tasks-app-id?token=${token}`)
      setTasksAppId(res.data.data)
      return res.data.data
    },
    refetchInterval: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className={`@container min-h-full w-full overflow-auto px-12 py-11`} style={{ backgroundColor }}>
      <Heading />
      <Subheading readonly />
      <ActionsCard readonly />
      <ReadonlyEditor token={token} content={content} />
    </div>
  )
}
