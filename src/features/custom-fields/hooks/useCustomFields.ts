'use client'

import {
  CustomFieldEntityType,
  type CustomFieldOption,
  CustomFieldType,
  ListCustomFieldResponseSchema,
} from '@assembly/types'
import type { IconType } from '@assembly-js/design-system'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '@/lib/core/axios.instance'

const CUSTOM_FIELDS_QUERY_KEY = 'custom-fields'
export const CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY = 'custom-field-options-map'

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
  options: CustomFieldOption[]
}

/** Nested map: { [entityType]: { [fieldKey]: { [optionKey]: optionLabel } } } */
export type CustomFieldOptionsMap = Record<string, Record<string, Record<string, string>>>

type CustomFieldItemWithEntity = CustomFieldItem & { entityType: CustomFieldEntityType }

export const useCustomFields = () => {
  const { data: customFields, isLoading: fieldsIsLoading } = useQuery({
    queryKey: [CUSTOM_FIELDS_QUERY_KEY],
    queryFn: async (): Promise<CustomFieldItemWithEntity[]> => {
      const res = await api.get('/api/custom-fields')
      const parsed = ListCustomFieldResponseSchema.parse(res.data)
      return parsed.data
        .sort((a, b) => a.order - b.order)
        .map(({ id, key, name, type, options, entityType }) => ({
          id,
          key,
          name,
          type,
          options,
          entityType,
          icon: CUSTOM_FIELD_TYPE_ICON[type],
        }))
    },
  })

  // Split the single response by entity type, since field keys are only
  // unique within an entity type (client vs company).
  const { clientCustomFields, companyCustomFields } = useMemo(() => {
    const client: CustomFieldItem[] = []
    const company: CustomFieldItem[] = []
    for (const { entityType, ...field } of customFields ?? []) {
      if (entityType === CustomFieldEntityType.CLIENT) client.push(field)
      else if (entityType === CustomFieldEntityType.COMPANY) company.push(field)
    }
    return { clientCustomFields: client, companyCustomFields: company }
  }, [customFields])

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
