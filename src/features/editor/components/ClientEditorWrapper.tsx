'use client'

import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { useViewStore } from '@editor/stores/viewStore'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useQuery } from '@tanstack/react-query'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { useAppDisplayNames } from '@/features/action-items/hooks/useAppDisplayNames'
import { Banner } from '@/features/banner'
import { getImageUrl } from '@/features/banner/lib/utils'
import { api } from '@/lib/core/axios.instance'
import { isDarkColor } from '@/utils/color'
import { cn } from '@/utils/tailwind'
import { Heading } from './Heading'
import { Subheading } from './Subheading'

export const ClientEditorWrapper = () => {
  const content = useSettingsStore((store) => store.content)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const setTasksAppId = useViewStore((store) => store.setTasksAppId)
  const bannerImages = useSettingsStore((store) => store.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const bannerUrl = bannerImages?.find((item) => item.id === bannerId)
  const bannerPositionX = useSettingsStore((store) => store.bannerPositionX) ?? 50
  const bannerPositionY = useSettingsStore((store) => store.bannerPositionY) ?? 50

  useQuery({
    queryKey: ['tasks-app-id'],
    queryFn: async (): Promise<string> => {
      const res = await api.get<{ data: string }>('/api/workspace/tasks-app-id')
      setTasksAppId(res.data.data)
      return res.data.data
    },
    refetchInterval: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  useAppDisplayNames()

  const isDark = isDarkColor(backgroundColor)

  return (
    <div
      className={cn('min-h-full w-full overflow-auto', isDark && 'dark')}
      style={{ backgroundColor, '--bg-color': backgroundColor } as React.CSSProperties}
    >
      <div className="@container mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-5 min-[860px]:px-12 min-[860px]:py-11">
        <div className="flex flex-col gap-1.5">
          <Heading readonly />
          <Subheading readonly />
        </div>
        {bannerUrl && getImageUrl(bannerUrl.path) && (
          <Banner
            src={getImageUrl(bannerUrl.path) ?? ''}
            alt="Workspace Banner"
            positionX={bannerPositionX}
            positionY={bannerPositionY}
          />
        )}

        <ActionsCard readonly />
        <ReadonlyEditor content={content} />
      </div>
    </div>
  )
}
