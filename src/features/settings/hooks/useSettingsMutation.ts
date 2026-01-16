import { useAuthStore } from '@auth/providers/auth.provider'
import { SETTINGS_QUERY_KEY } from '@settings/constants'
import type { SettingsResponseDto, SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'
import { getQueryClient } from '@/lib/core/query.utils'

export const useSettingsMutation = () => {
  const token = useAuthStore((s) => s.token)

  const setSettings = useSettingsStore((s) => s.setSettings)
  const setInitialSettings = useSettingsStore((s) => s.setInitialSettings)

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: SettingsUpdateDto) => {
      return api
        .patch<{ data: SettingsResponseDto }>(`${ROUTES.api.settings}/?token=${token}`, settings)
        .then((res) => res.data)
    },
    onSuccess: (data) => {
      const queryClient = getQueryClient()
      queryClient.setQueryData([SETTINGS_QUERY_KEY], data.data)

      setSettings({ ...data.data })
      setInitialSettings({ ...data.data })
    },
  })

  return updateSettingsMutation
}
