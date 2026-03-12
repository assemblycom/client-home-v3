'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import type { SegmentResponseDto } from '@segments/lib/segments.dto'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

export const SEGMENTS_QUERY_KEY = 'segments'

export const useSegments = () => {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: [SEGMENTS_QUERY_KEY],
    queryFn: async (): Promise<SegmentResponseDto[]> => {
      const res = await api.get(`/api/segments?token=${token}`)
      return res.data.data
    },
  })

  return {
    segments: data ?? [],
    isLoading,
  }
}
