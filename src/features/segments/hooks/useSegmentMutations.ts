'use client'

import { SEGMENT_STATS_QUERY_KEY } from '@segments/hooks/useSegments'
import type { SegmentCreateDto } from '@segments/lib/segments.dto'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

export const useSegmentMutations = () => {
  const queryClient = useQueryClient()

  const invalidateSegments = async () => {
    await queryClient.invalidateQueries({ queryKey: [SEGMENT_STATS_QUERY_KEY], refetchType: 'all' })
  }

  const createSegment = useMutation({
    mutationFn: async (payload: SegmentCreateDto) => {
      const res = await api.post('/api/segments', payload)
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
      const res = await api.patch(`/api/segments/${id}`, payload)
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/segments/${id}`)
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  const deleteAllSegments = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/api/segments')
      return res.data.data
    },
    onSuccess: invalidateSegments,
  })

  return { createSegment, updateSegment, deleteSegment, deleteAllSegments }
}
