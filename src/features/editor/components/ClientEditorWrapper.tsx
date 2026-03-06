'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { useViewStore } from '@editor/stores/viewStore'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useQuery } from '@tanstack/react-query'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'
import { api } from '@/lib/core/axios.instance'
import { Heading } from './Heading'
import { Subheading } from './Subheading'

export const ClientEditorWrapper = () => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const setTasksAppId = useViewStore((store) => store.setTasksAppId)
  const bannerImages = useSettingsStore((store) => store.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const bannerUrl = bannerImages?.find((item) => item.id === bannerId)

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
    <div
      className={`@container mx-auto flex min-h-full w-full max-w-xl flex-col gap-5 overflow-auto px-12 py-11`}
      style={{ backgroundColor }}
    >
      <div className="flex flex-col gap-1.5">
        <Heading readonly />
        <Subheading readonly />
      </div>
      {bannerUrl ? <Banner src={getImageUrl(bannerUrl.path, token)} alt="Workspace Banner" /> : null}

      <ActionsCard readonly />
      <ReadonlyEditor token={token} content={content} />
    </div>
  )
}
