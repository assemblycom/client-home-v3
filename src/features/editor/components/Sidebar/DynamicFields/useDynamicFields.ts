import {
  BUILT_IN_FIELDS,
  getFieldDisplayContent,
} from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { useViewStore } from '@editor/stores/viewStore'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'
import type { DynamicField } from '@/features/editor/components/Sidebar/DynamicFields/type'

export const useDynamicFields = () => {
  const { clientCustomFields, companyCustomFields } = useCustomFields()

  const workspace = useViewStore((store) => store.workspace)
  const labels = workspace?.labels

  const toData = (value: string, name: string, icon: DynamicField['data'][number]['icon']) => ({
    fieldContent: getFieldDisplayContent(value, labels),
    value,
    name,
    icon,
  })

  const dynamicFields: DynamicField[] = [
    {
      type: 'client',
      data: [
        ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'client').map((f) => toData(f.value, f.name, f.icon)),
        ...clientCustomFields.map(({ key, name, icon }) => toData(`{{client.${key}}}`, name, icon)),
      ],
    },
    {
      type: 'company',
      data: [
        ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'company').map((f) => toData(f.value, f.name, f.icon)),
        ...companyCustomFields.map(({ key, name, icon }) => toData(`{{company.${key}}}`, name, icon)),
      ],
    },
    {
      type: 'workspace',
      data: BUILT_IN_FIELDS.filter((f) => f.entityType === 'workspace').map((f) => toData(f.value, f.name, f.icon)),
    },
  ]

  return { dynamicFields }
}
