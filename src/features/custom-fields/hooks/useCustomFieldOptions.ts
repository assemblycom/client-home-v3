'use client'

import type { CustomFieldOption } from '@assembly/types'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

const CUSTOM_FIELD_OPTIONS_QUERY_KEY = 'custom-field-options'

export const useCustomFieldOptions = (fieldId: string | null) => {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: [CUSTOM_FIELD_OPTIONS_QUERY_KEY, fieldId],
    queryFn: async (): Promise<CustomFieldOption[]> => {
      const res = await api.get(`/api/custom-fields/values/${fieldId}?token=${token}`)
      return res.data.data
    },
    enabled: !!fieldId,
  })

  return {
    options: data ?? [],
    isLoading,
  }
}
