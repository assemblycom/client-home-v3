import { useAuthStore } from '@auth/providers/auth.provider'
import { MEDIA_QUERY_KEY } from '@media/constants'
import type { MediaType } from '@media/lib/media.entity'
import type { CreateMediaRequestDto } from '@media/media.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'
import { getQueryClient } from '@/lib/core/query.utils'

export const useBannerMutation = () => {
  const token = useAuthStore((s) => s.token)

  const setBannerImages = useSettingsStore((state) => state.setBannerImages)
  const bannerImages = useSettingsStore((store) => store?.bannerImages) ?? []

  const createBannerMutation = useMutation({
    mutationFn: (media: CreateMediaRequestDto) => {
      return api.post<{ data: MediaType }>(`${ROUTES.api.bannerImages}/?token=${token}`, media).then((res) => res.data)
    },
    onSuccess: (data) => {
      const queryClient = getQueryClient()
      queryClient.setQueryData([MEDIA_QUERY_KEY], data.data)
      const { id, path, workspaceId } = data.data
      setBannerImages([...bannerImages, { id, path, workspaceId }])
    },
  })

  return createBannerMutation
}
