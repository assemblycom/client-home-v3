import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'
import type { DynamicField } from '@/features/editor/components/Sidebar/DynamicFields/type'

export const useDynamicFields = () => {
  const { clientCustomFields, companyCustomFields } = useCustomFields()

  const dynamicFields: DynamicField[] = [
    {
      type: 'client',
      data: [
        { fieldContent: '{{client.firstName}}', name: 'First Name', icon: 'Profile' },
        { fieldContent: '{{client.lastName}}', name: 'Last Name', icon: 'Profile' },
        { fieldContent: '{{client.email}}', name: 'Email', icon: 'Email' },
        { fieldContent: '{{client.company}}', name: 'Company', icon: 'Building' },
        ...clientCustomFields.map(({ key, name, icon }) => ({
          fieldContent: `{{client.${key}}}`,
          name,
          icon,
        })),
      ],
    },
    {
      type: 'company',
      data: [
        { fieldContent: '{{company.address}}', name: 'Address', icon: 'Location' },
        { fieldContent: '{{company.email}}', name: 'Email', icon: 'Email' },
        ...companyCustomFields.map(({ key, name, icon }) => ({
          fieldContent: `{{company.${key}}}`,
          name,
          icon,
        })),
      ],
    },
    {
      type: 'workspace',
      data: [{ fieldContent: '{{workspace.brand}}', name: 'Company Name', icon: 'Customization' }],
    },
  ]

  return { dynamicFields }
}
