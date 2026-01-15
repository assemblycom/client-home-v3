import { useAuthStore } from '@auth/providers/auth.provider'
import type { SettingsWithActions } from '@settings/lib/settings-actions.entity'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const useSettings = () => {
  const token = useAuthStore((s) => s.token)

  const settings = useQuery<SettingsWithActions>({
    queryKey: ['settings'],
    queryFn: () =>
      api.get<{ data: SettingsWithActions }>(`${ROUTES.api.settings}/?token=${token}`).then((res) => res.data.data),
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: SettingsWithActions) => {
      return api.post(`${ROUTES.api.settings}/?token=${token}`, settings)
    },
  })

  return { settings, updateSettingsMutation }
}
