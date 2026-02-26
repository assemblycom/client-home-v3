'use client'

import {
  BUILT_IN_FIELDS,
  type FieldEntityType,
  type FieldItem,
  getFieldDisplayContent,
} from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { useViewStore } from '@editor/stores/viewStore'
import { useMemo } from 'react'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

export type { FieldItem }

export const useDynamicFields = () => {
  const { clientCustomFields, companyCustomFields, isLoading } = useCustomFields()
  const labels = useViewStore((s) => s.workspace?.labels)

  const dynamicFields = useMemo(() => {
    const toItem = (field: (typeof BUILT_IN_FIELDS)[number]): FieldItem => ({
      value: field.value,
      label: getFieldDisplayContent(field.value, labels),
      name: field.name,
      icon: field.icon,
      entityType: field.entityType,
    })

    const toCustomItem = (
      entityType: FieldEntityType,
      key: string,
      name: string,
      icon: FieldItem['icon'],
    ): FieldItem => {
      const value = `{{${entityType}.${key}}}`
      return { value, label: getFieldDisplayContent(value, labels), name, icon, entityType }
    }

    return [
      ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'client').map(toItem),
      ...clientCustomFields.map(({ key, name, icon }) => toCustomItem('client', key, name, icon)),
      ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'company').map(toItem),
      ...companyCustomFields.map(({ key, name, icon }) => toCustomItem('company', key, name, icon)),
      ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'workspace').map(toItem),
    ]
  }, [clientCustomFields, companyCustomFields, labels])

  return { dynamicFields, isLoading }
}
