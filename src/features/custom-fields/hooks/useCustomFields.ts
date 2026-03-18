'use client'

import { CustomFieldEntityType, CustomFieldType, ListCustomFieldResponseSchema } from '@assembly/types'
import type { IconType } from '@assembly-js/design-system'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

const CUSTOM_FIELDS_QUERY_KEY = 'custom-fields'

const CUSTOM_FIELD_TYPE_ICON: Record<CustomFieldType, IconType> = {
  [CustomFieldType.ADDRESS]: 'Location',
  [CustomFieldType.EMAIL]: 'Email',
  [CustomFieldType.PHONE_NUMBER]: 'MobileNumber',
  [CustomFieldType.TEXT]: 'Text',
  [CustomFieldType.NUMBER]: 'Number',
  [CustomFieldType.URL]: 'Link',
  [CustomFieldType.TAGS]: 'Tag',
}

export type CustomFieldItem = {
  id: string
  key: string
  name: string
  type: CustomFieldType
  icon: IconType
}

export function useCustomFields() {
  const { data: clientCustomFields, isLoading: clientIsLoading } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY, CustomFieldEntityType.CLIENT],
    queryFn: async (): Promise<CustomFieldItem[]> => {
      const res = await api.get(`/api/custom-fields/${CustomFieldEntityType.CLIENT}`)
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return parsed.data
        .sort((a, b) => a.order - b.order)
        .map(({ id, key, name, type }) => ({ id, key, name, type, icon: CUSTOM_FIELD_TYPE_ICON[type] }))
    },
  })

  const { data: companyCustomFields, isLoading: companyIsLoading } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY, CustomFieldEntityType.COMPANY],
    queryFn: async (): Promise<CustomFieldItem[]> => {
      const res = await api.get(`/api/custom-fields/${CustomFieldEntityType.COMPANY}`)
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return parsed.data
        .sort((a, b) => a.order - b.order)
        .map(({ id, key, name, type }) => ({ id, key, name, type, icon: CUSTOM_FIELD_TYPE_ICON[type] }))
    },
  })

  return {
    clientCustomFields: clientCustomFields ?? [],
    companyCustomFields: companyCustomFields ?? [],
    isLoading: clientIsLoading || companyIsLoading,
  }
}
