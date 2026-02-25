'use client'

import { CustomFieldEntityType, ListCustomFieldResponseSchema } from '@assembly/types'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

const CUSTOM_FIELDS_QUERY_KEY = 'custom-fields'

type CustomFieldItem = {
  key: string
  name: string
}

export function useCustomFields() {
  const token = useAuthStore((s) => s.token)

  const { data: clientCustomFields } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY, CustomFieldEntityType.CLIENT],
    queryFn: async (): Promise<CustomFieldItem[]> => {
      const res = await api.get(`/api/custom-fields/${CustomFieldEntityType.CLIENT}?token=${token}`)
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return parsed.data.sort((a, b) => a.order - b.order).map(({ key, name }) => ({ key, name }))
    },
  })

  const { data: companyCustomFields } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY, CustomFieldEntityType.COMPANY],
    queryFn: async (): Promise<CustomFieldItem[]> => {
      const res = await api.get(`/api/custom-fields/${CustomFieldEntityType.COMPANY}?token=${token}`)
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return parsed.data.sort((a, b) => a.order - b.order).map(({ key, name }) => ({ key, name }))
    },
  })

  return {
    clientCustomFields: clientCustomFields ?? [],
    companyCustomFields: companyCustomFields ?? [],
  }
}
