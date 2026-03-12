'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import type { SegmentStatsResponseDto } from '@segments/lib/segments.dto'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

export const SEGMENT_STATS_QUERY_KEY = 'segment-stats'

export const useSegmentStats = () => {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [SEGMENT_STATS_QUERY_KEY],
    queryFn: async (): Promise<SegmentStatsResponseDto> => {
      const res = await api.get(`/api/segments/stats?token=${token}`)
      return res.data.data
    },
  })

  return {
    stats: data ?? null,
    isLoading,
    isFetching,
  }
}
