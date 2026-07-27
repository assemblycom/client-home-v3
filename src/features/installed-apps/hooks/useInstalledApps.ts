'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { type ActionableInstallsDto, ActionableInstallsDtoSchema } from '@installed-apps/installed-apps.dto'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const INSTALLED_APPS_QUERY_KEY = 'installed-apps'

export const useInstalledApps = () => {
  const workspaceId = useAuthStore((s) => s.workspaceId)

  const { data, isLoading } = useQuery({
    queryKey: [INSTALLED_APPS_QUERY_KEY, workspaceId],
    queryFn: async (): Promise<ActionableInstallsDto> => {
      const res = await api.get<{ data: ActionableInstallsDto }>(ROUTES.api.installedApps)
      return ActionableInstallsDtoSchema.parse(res.data.data)
    },
    enabled: Boolean(workspaceId),
  })

  return {
    installedApps: data ?? [],
    isLoading,
  }
}
