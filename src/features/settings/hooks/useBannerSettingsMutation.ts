import { useViewStore } from '@editor/stores/viewStore'
import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

type BannerSettingsPayload = Partial<Pick<SettingsResponseDto, 'bannerImageId' | 'bannerPositionX' | 'bannerPositionY'>>

export const useBannerSettingsMutation = () => {
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const setInitialSettings = useSettingsStore((s) => s.setInitialSettings)

  return useMutation({
    mutationFn: (payload: BannerSettingsPayload) => {
      const params = new URLSearchParams()
      if (activeSegmentId) params.set('segmentId', activeSegmentId)

      return api
        .patch<{ data: SettingsResponseDto }>(`${ROUTES.api.settings}/?${params}`, payload)
        .then((res) => res.data)
    },
    onMutate: (variables) => {
      setSettings(variables)
    },
    onSuccess: (data) => {
      const { bannerImageId, bannerPositionX, bannerPositionY } = data.data
      const bannerFields = { bannerImageId, bannerPositionX, bannerPositionY }

      setSettings(bannerFields)
      setInitialSettings(bannerFields as SettingsResponseDto)
    },
  })
}
