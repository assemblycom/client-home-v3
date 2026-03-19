import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const useDeleteBannerMutation = () => {
  const setBannerImages = useSettingsStore((state) => state.setBannerImages)
  const bannerImages = useSettingsStore((store) => store?.bannerImages) ?? []

  const deleteBannerMutation = useMutation({
    mutationFn: (mediaId: string) => {
      return api.delete(`${ROUTES.api.bannerImages}/?mediaId=${mediaId}`)
    },
    onSuccess: (_data, mediaId) => {
      setBannerImages(bannerImages.filter((img) => img.id !== mediaId))
    },
  })

  return deleteBannerMutation
}
