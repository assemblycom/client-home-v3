'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { NotificationCountsDtoSchema } from '@notification-counts/notification-counts.dto'
import { useQuery } from '@tanstack/react-query'
import { useUsersStore } from '@users/stores/usersStore'
import { api } from '@/lib/core/axios.instance'

const NOTIFICATION_COUNTS_QUERY_KEY = 'notification-counts'

export function useNotificationCounts() {
  const previewClient = useUsersStore((store) => store.previewClient)

  const companyId = useAuthStore((s) => s.companyId)
  const token = useAuthStore((s) => s.token)
  const viewMode = useViewStore((store) => store.viewMode)

  const { data: counts, isLoading } = useQuery({
    queryKey: [NOTIFICATION_COUNTS_QUERY_KEY, previewClient?.id],
    queryFn: async (): Promise<NotificationCountsDto> => {
      const params = new URLSearchParams({ token })
      if (companyId) params.set('companyId', companyId)

      const res = await api.get<{ data: NotificationCountsDto }>(
        `/api/users/${previewClient?.id}/notification-counts?token=${token}&companyId=${previewClient?.companyId}`,
      )
      return NotificationCountsDtoSchema.parse(res.data.data)
    },
    enabled: !!previewClient?.id && viewMode !== ViewMode.EDITOR,
  })

  return {
    counts: counts ?? null,
    isLoading: !!previewClient?.id && isLoading,
  }
}
