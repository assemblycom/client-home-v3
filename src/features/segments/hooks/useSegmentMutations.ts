'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { SEGMENT_STATS_QUERY_KEY, SEGMENTS_QUERY_KEY } from '@segments/hooks/useSegments'
import type { SegmentCreateDto } from '@segments/lib/segments.dto'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'
import { getQueryClient } from '@/lib/core/query.utils'

export const useSegmentMutations = () => {
  const token = useAuthStore((s) => s.token)
  const queryClient = getQueryClient()

  const invalidateSegments = () => {
    queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [SEGMENT_STATS_QUERY_KEY] })
  }

  const createSegment = useMutation({
    mutationFn: async (payload: SegmentCreateDto) => {
      const res = await api.post(`/api/segments?token=${token}`, payload)
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  const updateSegment = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string
      name?: string
      conditions?: SegmentCreateDto['conditions']
    }) => {
      const res = await api.patch(`/api/segments/${id}?token=${token}`, payload)
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/segments/${id}?token=${token}`)
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  return { createSegment, updateSegment, deleteSegment }
}
