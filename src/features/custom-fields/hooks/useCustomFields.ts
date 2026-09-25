'use client'

import { ListCustomFieldResponseSchema } from '@assembly/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  type CustomFieldItemWithEntity,
  type CustomFieldOptionsMap,
  mapCustomFields,
  splitCustomFieldsByEntity,
} from '@/features/custom-fields/utils/custom-field-mappers'
import { api } from '@/lib/core/axios.instance'

export type { CustomFieldItem, CustomFieldOptionsMap } from '@/features/custom-fields/utils/custom-field-mappers'

const CUSTOM_FIELDS_QUERY_KEY = 'custom-fields'
export const CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY = 'custom-field-options-map'

export const useCustomFields = () => {
  const { data: customFields, isLoading: fieldsIsLoading } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY],
    queryFn: async (): Promise<CustomFieldItemWithEntity[]> => {
      const res = await api.get('/api/custom-fields')
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return mapCustomFields(parsed.data)
    },
  })

  // Split the single response by entity type, since field keys are only
  // unique within an entity type (client vs company).
  const { clientCustomFields, companyCustomFields } = useMemo(
    () => splitCustomFieldsByEntity(customFields ?? []),
    [customFields],
  )

  const { data: optionsMap, isLoading: optionsMapIsLoading } = useQuery({
    queryKey: [CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY],
    queryFn: async (): Promise<CustomFieldOptionsMap> => {
      const res = await api.get('/api/custom-fields/options-map')
      return res.data.data
    },
  })

  return {
    clientCustomFields,
    companyCustomFields,
    optionsMap: optionsMap ?? {},
    isLoading: fieldsIsLoading || optionsMapIsLoading,
  }
}
