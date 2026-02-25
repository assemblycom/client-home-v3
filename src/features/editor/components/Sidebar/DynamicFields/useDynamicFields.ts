import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'
import type { DynamicField } from '@/features/editor/components/Sidebar/DynamicFields/type'

export const useDynamicFields = () => {
  const { clientCustomFields, companyCustomFields } = useCustomFields()

  const dynamicFields: DynamicField[] = [
    {
      type: 'client',
      data: [
        {
          fieldContent: '{{client.firstName}}',
          name: 'First Name',
        },
        {
          fieldContent: '{{client.lastName}}',
          name: 'Last Name',
        },
        {
          fieldContent: '{{client.email}}',
          name: 'Email',
        },
        {
          fieldContent: '{{client.company}}',
          name: 'Company',
        },
        ...clientCustomFields.map(({ key, name }) => ({
          fieldContent: `{{client.${key}}}`,
          name,
        })),
      ],
    },
    {
      type: 'company',
      data: [
        {
          fieldContent: '{{company.address}}',
          name: 'Address',
        },
        {
          fieldContent: '{{company.email}}',
          name: 'Email',
        },
        ...companyCustomFields.map(({ key, name }) => ({
          fieldContent: `{{company.${key}}}`,
          name,
        })),
      ],
    },
    {
      type: 'workspace',
      data: [
        {
          fieldContent: '{{workspace.brand}}',
          name: 'Company Name',
        },
      ],
    },
  ]

  return { dynamicFields }
}
