'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { NotificationCountsDtoSchema } from '@notification-counts/notification-counts.dto'
import { useQuery } from '@tanstack/react-query'
import { useUsersStore } from '@users/stores/usersStore'
import { useShallow } from 'zustand/shallow'
import { api } from '@/lib/core/axios.instance'

const NOTIFICATION_COUNTS_QUERY_KEY = 'notification-counts'

export function useNotificationCounts() {
  const { clientId, companyId, token } = useAuthStore(
    useShallow((s) => ({ clientId: s.clientId, companyId: s.companyId, token: s.token })),
  )

  const previewClient = useUsersStore((store) => store.previewClient)
  const viewMode = useViewStore((store) => store.viewMode)

  const enabled = Boolean((viewMode === ViewMode.PREVIEW && previewClient?.id) || clientId)
  const targetClientId = viewMode === ViewMode.PREVIEW ? previewClient?.id : clientId
  const targetCompanyId = viewMode === ViewMode.PREVIEW ? previewClient?.companyId : companyId

  const { data: counts, isLoading } = useQuery({
    queryKey: [NOTIFICATION_COUNTS_QUERY_KEY, targetClientId],
    queryFn: async (): Promise<NotificationCountsDto> => {
      const res = await api.get<{ data: NotificationCountsDto }>(
        `/api/users/${targetClientId}/notification-counts?token=${token}&companyId=${targetCompanyId}`,
      )
      return NotificationCountsDtoSchema.parse(res.data.data)
    },
    enabled,
  })

  return {
    counts: counts ?? null,
    isLoading: !!previewClient?.id && isLoading,
  }
}
