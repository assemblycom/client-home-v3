'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import type { SegmentResponseDto, SegmentStatsResponseDto } from '@segments/lib/segments.dto'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const SEGMENTS_QUERY_KEY = 'segments'
export const SEGMENT_STATS_QUERY_KEY = 'segment-stats'

export const useSegments = () => {
  const token = useAuthStore((s) => s.token)

  const { data: segments, isLoading } = useQuery({
    queryKey: [SEGMENTS_QUERY_KEY],
    queryFn: async (): Promise<SegmentResponseDto[]> => {
      const res = await api.get<{ data: SegmentResponseDto[] }>(`${ROUTES.api.segments}?token=${token}`)
      return res.data.data
    },
  })

  return {
    segments: segments ?? [],
    isLoading,
  }
}

export const useSegmentStats = () => {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [SEGMENT_STATS_QUERY_KEY],
    queryFn: async (): Promise<SegmentStatsResponseDto> => {
      const res = await api.get<{ data: SegmentStatsResponseDto }>(`${ROUTES.api.segmentStats}?token=${token}`)
      return res.data.data
    },
  })

  return {
    stats: data ?? null,
    isLoading,
    isFetching,
  }
}
