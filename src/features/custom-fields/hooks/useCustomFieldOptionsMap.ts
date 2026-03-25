'use client'

import {
  CustomFieldEntityType,
  ListCustomFieldOptionsResponseSchema,
  ListCustomFieldResponseSchema,
} from '@assembly/types'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

/** Flat map from option key → option label across all custom fields */
export type CustomFieldOptionsMap = Record<string, string>

const CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY = 'custom-field-options-map'

export const useCustomFieldOptionsMap = () => {
  const { data, isLoading } = useQuery({
    queryKey: [CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY],
    queryFn: async (): Promise<CustomFieldOptionsMap> => {
      const [clientFields, companyFields] = await Promise.all([
        api
          .get(`/api/custom-fields/${CustomFieldEntityType.CLIENT}`)
          .then((res) => ListCustomFieldResponseSchema.parse(res.data)),
        api
          .get(`/api/custom-fields/${CustomFieldEntityType.COMPANY}`)
          .then((res) => ListCustomFieldResponseSchema.parse(res.data)),
      ])

      const allFields = [...clientFields.data, ...companyFields.data]

      const optionsResults = await Promise.all(
        allFields.map((field) =>
          api
            .get(`/api/custom-fields/values/${field.id}`)
            .then((res) => ListCustomFieldOptionsResponseSchema.parse(res.data))
            .then((parsed) => parsed.data)
            .catch(() => []),
        ),
      )

      const map: CustomFieldOptionsMap = {}
      for (const options of optionsResults) {
        for (const option of options) {
          map[option.key] = option.label
        }
      }
      return map
    },
  })

  return { optionsMap: data ?? {}, isLoading }
}
