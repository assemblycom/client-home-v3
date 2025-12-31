import type { DynamicField } from '@/features/editor/components/Sidebar/DynamicFields/type'

export const useDynamicFields = () => {
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
