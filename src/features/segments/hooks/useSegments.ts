'use client'

import type { SegmentStatsResponseDto } from '@segments/lib/segments.dto'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const SEGMENT_STATS_QUERY_KEY = 'segment-stats'

export const useSegmentStats = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [SEGMENT_STATS_QUERY_KEY],
    queryFn: async (): Promise<SegmentStatsResponseDto> => {
      const res = await api.get<{ data: SegmentStatsResponseDto }>(ROUTES.api.segmentStats)
      return res.data.data
    },
  })

  return {
    totalClients: data?.totalClients || 0,
    segmentConfig: data?.segmentConfig ?? null,
    segments: data?.segments,
    isLoading,
    isFetching,
  }
}
