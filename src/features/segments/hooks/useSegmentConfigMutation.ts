'use client'

import { SEGMENT_STATS_QUERY_KEY } from '@segments/hooks/useSegments'
import type { SegmentConfigResponse, SegmentConfigUpsertDto } from '@segments/lib/segments.dto'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const useSegmentConfigMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SegmentConfigUpsertDto): Promise<SegmentConfigResponse> => {
      const res = await api.put(ROUTES.api.segmentConfig, payload)
      return res.data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SEGMENT_STATS_QUERY_KEY], refetchType: 'all' })
    },
  })
}
